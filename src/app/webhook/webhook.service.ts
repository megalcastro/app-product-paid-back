import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OrderService } from "../order/order.service";
import { ProductService } from "../product/product.service";
import { OrderStatus } from '../order/order-status.enum';


@Injectable()
export class WebHookService {

    constructor(private readonly orderService: OrderService,
                private readonly productService: ProductService
    ) {}


  async handlePayments(payload: any): Promise<any> {

  if (!payload || !payload.reference) {
    throw new BadRequestException('Invalid payment payload provided');
  }

  // Buscar orden
  const order = await this.orderService.findOne(payload.reference);
  if (!order) {
    throw new NotFoundException(`Order with ID ${payload.reference} not found`);
  }

  // Actualizar estado de la orden basado en el resultado de la transacción
  if (payload.status !== OrderStatus.APPROVED) {
    await this.orderService.update(payload.orderId, { status: OrderStatus.FAILED });
    return;
  }

  // Actualizar estado de la orden a "Pagada"
  await this.orderService.update(payload.reference, { status: OrderStatus.APPROVED });

  // Actualizar stock de los productos
  const productStockUpdates = order.items.map(async (item) => {
    const product = await this.productService.findOne(item.product.id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${item.product.id} not found`);
    }

    if (product.stock < item.quantity) {
      throw new BadRequestException(
        `Insufficient stock for Product ID ${item.product.id}. Available: ${product.stock}, Requested: ${item.quantity}`,
      );
    }

    return this.productService.update(product.id, {
      stock: product.stock - item.quantity,
    });
  });

  // Ejecutar las actualizaciones concurrentemente
  await Promise.all(productStockUpdates);
  }
}



// async handlePayment(payload: { orderId: string; transactionResult: string }): Promise<void> {

// }