import { z } from 'zod';
import { generalFields } from '../middleware/middleware-Validation';

export const getStoreOrdersSchema = {
    params: z.object({
        storeId: generalFields.id,
    })
};

export const getCustomerOrdersSchema = {
    params: z.object({
        customerId: generalFields.id,
    })
};
