import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAllPending() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.PENDING },
      include: {
        client: { select: { email: true } },
        items: { include: { product: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async approveOrder(orderId: string, approvedItems: { order_item_id: string; approved_qty: number }[]) {
    // Transaction pour mettre à jour les quantités et le statut de la commande
    return this.prisma.$transaction(async (tx) => {
      // 1. Mettre à jour chaque ligne de commande
      for (const item of approvedItems) {
        await tx.orderItem.update({
          where: { id: item.order_item_id },
          data: { approved_qty: item.approved_qty },
        });
      }

      // 2. Mettre à jour le statut de la commande
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.APPROVED },
        include: { items: true },
      });

      return updatedOrder;
    });
  }

  async generatePdf(orderId: string) {
    // Logique de génération de PDF (ex: avec puppeteer ou pdfmake)
    // Ici nous simulons la génération
    return {
      success: true,
      url: `https://storage.agro-rayane.dz/bl/BL-${orderId}.pdf`,
    };
  }
}
