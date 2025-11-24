import type { Request, Response } from "express"
import * as validators from "./product.validation"
import { BadRequestException, NotFoundException } from "../utils/error.response";
import { ProductRepository } from "../DB/repository";
import { ProductModel } from "./product.module";
import { v4 as uuid } from 'uuid';
import {  uploadFiles } from "../utils/s3.config";
import { StorageEnum } from "../utils/cloud.multer";
import slugify from "slugify";
import { successResponse } from "../utils/success.response";
import { Types } from "mongoose";



export enum RoleEnum {
    admin = "admin",
    user = "user"
}



//product.service
class ProductController {
    private productModel = new ProductRepository(ProductModel)
    userModel: any;
    constructor() { }

    createProduct = async (req: Request, res: Response): Promise<Response> => {

        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            })
        }
        const createProductDto = validationResult.data;

        const assistFolderId = uuid();
        const files = req.files as Express.Multer.File[] || [];
        const images = await uploadFiles({
            storageApproach: StorageEnum.memory,
            files,
            path: `products/${assistFolderId}`,
            useLarge: true

        })

        const salePrice = createProductDto.mainPrice - (createProductDto.mainPrice * ((createProductDto.discountPercent ?? 0) / 100));

        createProductDto.slug = slugify(createProductDto.name, { lower: true, strict: true });


        const [product] = await this.productModel.create({
            data: [{
                ...createProductDto,
                assistFolderId,
                images,
                salePrice,
                // createdBy:req.user?._id
            }]
        })

        if (!product) {
            throw new BadRequestException("Fail to create this product instance");
        }


        return successResponse({ res, statuscode: 201, data: { product } })

    }





    updateProduct = async (req: Request, res: Response): Promise<Response> => {

        const { _id } = req.params;

        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            })
        }
        const updateProductDto = validationResult.data;

        const product = await this.productModel.findOne({

            filter: { productId: _id }
        });

        if (!product) {
            throw new NotFoundException("fail to find matching product instance")
        }


        let salePrice = product.salePrice;
        if (updateProductDto.mainPrice || updateProductDto.discountPercent) {
            const mainPrice = updateProductDto.mainPrice ?? product.mainPrice;
            const discountPercent = updateProductDto.discountPercent ?? product.discountPercent;
            const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
            salePrice = finalPrice > 0 ? finalPrice : 1

        }

        updateProductDto.slug = slugify(updateProductDto.name, { lower: true, strict: true });

        const updatedProduct = await this.productModel.findOneAndUpdate({
            filter: { productId: _id },
            update: {
                ...updateProductDto,
                salePrice,
                // updatedBy:user ._id
            }
        })


        if (!updatedProduct) {
            throw new BadRequestException("fail to update this product instance")
        }

        return successResponse({ res, statuscode: 201, data: { updatedProduct } })


    }




    updateProductAttachment = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;

        if (!productId) {
            throw new BadRequestException("Missing productId in request params");
        }

        const files = (req.files as Express.Multer.File[]) || [];

        const product = await this.productModel.findOne({
            filter: { _id: productId }
        });

        if (!product) {
            throw new NotFoundException("Failed to find matching product instance");
        }

        let attachment: string[] = [];
        if (files.length > 0) {
            attachment = await uploadFiles({
                files,
                path: product._id.toString(),
            });
        }

        const updateProduct = {
            ...req.body,
            ...(attachment.length > 0 && { attachment }),
            // updatedBy: req.user?.id,
        };

        const updatedProduct = await this.productModel.findOneAndUpdate({
            filter: { _id: productId },
            update: updateProduct,
            options: { new: true }
        });

        if (!updatedProduct) {
            throw new BadRequestException("Failed to update this product instance");
        }

        return successResponse({
            res,
            statuscode: 200,
            data: { updatedProduct },
        });
    };



    freezeProduct = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;

        if (!productId) {
            throw new NotFoundException("Product ID is required");
        }


        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }


        const updated = await ProductModel.updateOne(
            {
                _id: productId,
                freezedAt: { $exists: false }
            },
            {
                $set: {
                    freezedAt: new Date(),
                    // freezedBy: req.user?.id,
                    changeCredentialsTime: new Date(),
                }
            }
        );


        if (updated.matchedCount === 0) {
            throw new NotFoundException("Product not found or already frozen");
        }

        return successResponse({
            res,
            statuscode: 200,
            data: { productId }
        });
    };




    restoreProduct = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params

        const restore = await ProductModel.updateOne(
            { _id: productId, freezedAt: { $exists: true } },
            {
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1
                },
                $set: {
                    restoreAt: new Date(),
                    // restoreBy: req.user?.id
                }
            }
        );

        if (restore.matchedCount === 0) {
            throw new NotFoundException("not found product or fail to restore this resource");
        }


        // if (!user.matchedCount) {
        //     throw new NotFoundException(" not found  product or fail to restore this resource")
        // }



        return successResponse({ res })

    }



  


}
export default new ProductController();