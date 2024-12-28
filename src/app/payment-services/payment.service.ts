import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import { generateSignature } from '../../utils/utils';

type CreateTransactionParams = {
    orderId: string;
    totalAmount: number;
    customerEmail: string;
    installments: number;
    tokenCard: string;
  };



@Injectable()
export class PaymentService {
  constructor(
 
  ) {}

   async createTransaction({
    orderId,
    totalAmount,
    customerEmail,
    installments = 0,
    tokenCard,
  }: CreateTransactionParams): Promise<any> {
    try {
      const privateKey = process.env.PRIVATE_KEY;
      const baseUrlTransaction = process.env.BASE_URL_TRANSACTION;
  
      if (!privateKey || !baseUrlTransaction) {
        throw new HttpException(
          'Missing required environment variables.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      const amountInCents = totalAmount * 100;
  

      const signature = generateSignature({
        amount_in_cents: amountInCents,
        reference: orderId,
        currency: 'COP',
      });
  
      const transactionPayload = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        acceptance_token: "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MjQzLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvcmVnbGFtZW50by1Vc3Vhcmlvcy1Db2xvbWJpYS5wZGYiLCJmaWxlX2hhc2giOiJkMWVkMDI3NjhlNDEzZWEyMzFmNzAwMjc0N2Y0N2FhOSIsImppdCI6IjE3MzUzMzc4ODMtNjg1MTciLCJlbWFpbCI6IiIsImV4cCI6MTczNTM0MTQ4M30.5IesG8SIrqyGDwzOSjEFhFlTamdm0mOHRu1eIkOCbEg",
        signature,
        customer_email: customerEmail,
        payment_method_type: "CARD",
        payment_method: {
        type: "CARD",
        installments,
        token: tokenCard,
        },
        reference: orderId,
      };
  
      const config = {
        headers: {
          Authorization: `Bearer ${privateKey}`,
        },
      };
  
      const { data } = await axios.post(
        `${baseUrlTransaction}/v1/transactions`,
        transactionPayload,
        config
      );
  
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const errorMessage =
          error.response?.data || 'An error occurred while processing the payment';
        throw new HttpException(errorMessage, statusCode);
      } else {
        throw new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}