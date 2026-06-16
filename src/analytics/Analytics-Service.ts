import { Types } from "mongoose";
import { OrderModel } from "../order/Order-Module";

export class AnalyticsService {
    async getStoreSummary(storeId: string, periodDays: number) {
        if (!Types.ObjectId.isValid(storeId)) {
            throw new Error("Invalid storeId");
        }

        const storeObjectId = new Types.ObjectId(storeId);
        const now = new Date();
        const currentPeriodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

        // Fetch Orders for the last 2 * periodDays
        const orders = await OrderModel.find({
            storeId: storeObjectId,
            createdAt: { $gte: previousPeriodStart }
        }).lean();

        const currentOrders = orders.filter(o => o.createdAt! >= currentPeriodStart);
        const previousOrders = orders.filter(o => o.createdAt! < currentPeriodStart);

        // Calculate Revenue
        const currentRevenue = currentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Calculate Orders
        const currentOrderCount = currentOrders.length;
        const previousOrderCount = previousOrders.length;

        // Calculate AOV
        const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
        const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

        // Calculate New Customers
        // A "new customer" is a customer who buys from the store for the first time.
        // We find the first order date for each customer.
        const allCustomerOrders = await OrderModel.aggregate([
            { $match: { storeId: storeObjectId, customerId: { $ne: null } } },
            { $group: { _id: "$customerId", firstOrderDate: { $min: "$createdAt" } } },
            { $match: { firstOrderDate: { $gte: previousPeriodStart } } }
        ]);

        const currentNewCustomers = allCustomerOrders.filter(c => c.firstOrderDate >= currentPeriodStart).length;
        const previousNewCustomers = allCustomerOrders.filter(c => c.firstOrderDate < currentPeriodStart).length;

        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            totalRevenue: {
                value: parseFloat(currentRevenue.toFixed(2)),
                trend: parseFloat(calculateTrend(currentRevenue, previousRevenue).toFixed(1)),
                isPositive: currentRevenue >= previousRevenue
            },
            totalOrders: {
                value: currentOrderCount,
                trend: parseFloat(calculateTrend(currentOrderCount, previousOrderCount).toFixed(1)),
                isPositive: currentOrderCount >= previousOrderCount
            },
            newCustomers: {
                value: currentNewCustomers,
                trend: parseFloat(calculateTrend(currentNewCustomers, previousNewCustomers).toFixed(1)),
                isPositive: currentNewCustomers >= previousNewCustomers
            },
            avgOrderValue: {
                value: parseFloat(currentAOV.toFixed(2)),
                trend: parseFloat(calculateTrend(currentAOV, previousAOV).toFixed(1)),
                isPositive: currentAOV >= previousAOV
            }
        };
    }

    async getSalesChartData(storeId: string, periodDays: number) {
        if (!Types.ObjectId.isValid(storeId)) throw new Error("Invalid storeId");

        const storeObjectId = new Types.ObjectId(storeId);
        const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        const data = await OrderModel.aggregate([
            { $match: { storeId: storeObjectId, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, "$totalAmount", 0] } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log(`[Analytics] getSalesChartData storeId=${storeId} period=${periodDays}d → ${data.length} day buckets`);

        const chartData = [];
        for (let i = periodDays - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            const found = data.find(item => item._id === dateStr);
            chartData.push({
                date: dateStr,
                revenue: found ? parseFloat(found.revenue.toFixed(2)) : 0,
                orders: found ? found.orders : 0
            });
        }
        return chartData;
    }

    async getTopProducts(storeId: string, periodDays: number, limit: number = 5, sortBy: 'quantity' | 'revenue' = 'quantity') {
        if (!Types.ObjectId.isValid(storeId)) throw new Error("Invalid storeId");

        const storeObjectId = new Types.ObjectId(storeId);
        const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        const sortStage: any = sortBy === 'revenue' ? { $sort: { totalRevenue: -1 } } : { $sort: { totalQuantity: -1 } };

        const result = await OrderModel.aggregate([
            { $match: { storeId: storeObjectId, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
            { $unwind: "$items" },
            { 
                $group: { 
                    _id: "$items.storeProductId", 
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                } 
            },
            sortStage,
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: "storeproducts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "storeProduct"
                }
            },
            { $unwind: { path: "$storeProduct", preserveNullAndEmptyArrays: false } },
            {
                $lookup: {
                    from: "products",
                    localField: "storeProduct.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    _id: 1,
                    totalQuantity: 1,
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    name: "$product.name",
                    image: { $arrayElemAt: ["$product.images", 0] },
                    price: "$storeProduct.price"
                }
            }
        ]);

        console.log(`[Analytics] getTopProducts storeId=${storeId} period=${periodDays}d → ${result.length} products`);
        return result;
    }

    async getOrderStatusBreakdown(storeId: string, periodDays: number) {
        if (!Types.ObjectId.isValid(storeId)) throw new Error("Invalid storeId");

        const storeObjectId = new Types.ObjectId(storeId);
        const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

        const data = await OrderModel.aggregate([
            { $match: { storeId: storeObjectId, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        return data.map(item => ({
            status: item._id,
            count: item.count
        }));
    }
}

export default new AnalyticsService();
