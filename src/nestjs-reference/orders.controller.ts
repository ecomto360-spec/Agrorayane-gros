import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('commercial/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.COMMERCIAL)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getPendingOrders(@Request() req) {
    // Le commercial voit les commandes de ses clients (simplifié ici pour toutes les commandes PENDING)
    return this.ordersService.findAllPending();
  }

  @Patch(':id')
  async correctAndApproveOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    // updateOrderDto contient un tableau : { items: [{ order_item_id: string, approved_qty: number }] }
    return this.ordersService.approveOrder(id, updateOrderDto.items);
  }

  @Get(':id/pdf')
  async generateDeliveryNote(@Param('id') id: string) {
    // Retourne l'URL du PDF généré ou le buffer PDF
    return this.ordersService.generatePdf(id);
  }
}
