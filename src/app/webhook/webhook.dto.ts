import {
    IsNotEmpty,
    IsString,
    IsNumber,
    ValidateNested,
    IsOptional,
    IsObject,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class TransactionDto {
    @IsNotEmpty()
    @IsString()
    id: string;
  
    @IsNotEmpty()
    @IsNumber()
    amount_in_cents: number;
  
    @IsNotEmpty()
    @IsString()
    status: string;
  
    @IsString()
    @IsOptional()
    reference?: string;
  
    @IsString()
    @IsOptional()
    customer_email?: string;
  
    @IsString()
    @IsOptional()
    currency?: string;
  }
  
  class SignatureDto {
    @IsNotEmpty()
    @IsObject()
    properties: string[];
  
    @IsNotEmpty()
    @IsString()
    checksum: string;
  }
  
  export class WebhookDto {
    @IsNotEmpty()
    @IsString()
    event: string;
  
    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => TransactionDto)
    data: { transaction: TransactionDto };
  
    @IsNotEmpty()
    @IsString()
    environment: string;
  
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => SignatureDto)
    signature: SignatureDto;
  
    @IsNotEmpty()
    @IsNumber()
    timestamp: number;
  
    @IsString()
    @IsOptional()
    sent_at?: string;
  }
  