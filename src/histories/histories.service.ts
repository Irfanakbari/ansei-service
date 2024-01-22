import { ConflictException, Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class HistoriesService {
  constructor(private prismaService: PrismaService) {}
  async create(createHistoryDto: CreateHistoryDto) {
    try {
      const isThere = await this.prismaService.rawData.findFirst({
        where: {
          poNumber: createHistoryDto.po_number,
        },
      });
      if (!isThere) {
        throw new RpcException(
          new ConflictException('Kode PO Number Tidak Ditemukan di Database'),
        );
      }
      const isNotSubmitted = await this.prismaService.history.findMany({
        where: {
          status: 'BERHASIL',
          po_number: createHistoryDto.po_number,
        },
      });
      if (isNotSubmitted.length > 0) {
        throw new RpcException(
          new ConflictException('Kode Part Number Ini Sudah Di Input'),
        );
      }
      return this.prismaService.history.createMany({
        data: {
          po_number: createHistoryDto.po_number,
          status: 'BERHASIL',
          operator: createHistoryDto.operator,
          timestamp: new Date(),
        },
      });
    } catch (e) {
      throw new RpcException(new ConflictException('Product was duplicate'));
    }
  }

  async findAll(options: any) {
    try {
      let datas = [];
      if (options.pageNumber > 0) {
        datas = await this.prismaService.history.findMany({
          skip: (options.pageNumber - 1) * parseInt(options.pageSize), // Menghitung berapa data yang harus dilewati (skip)
          take: parseInt(options.pageSize), // Mengambil jumlah data sebanyak yang diinginkan (limit)
        });
      } else {
        datas = await this.prismaService.history.findMany();
      }
      const count = await this.prismaService.history.count();
      return {
        data: datas,
        totalData: count,
        limit: options.pageSize ?? 0,
        currentPage: options.pageNumber ?? 0,
      };
    } catch (e) {
      throw new RpcException(new ConflictException('There was problem'));
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} history`;
  }

  async createFailed(createHistoryDto: CreateHistoryDto) {
    try {
      const isThere = await this.prismaService.rawData.findFirst({
        where: {
          poNumber: createHistoryDto.po_number,
        },
      });
      if (!isThere) {
        throw new RpcException(
          new ConflictException('Kode Part Number Tidak Ditemukan di Database'),
        );
      }
      return this.prismaService.history.createMany({
        data: {
          po_number: createHistoryDto.po_number,
          status: 'GAGAL',
          operator: createHistoryDto.operator,
          timestamp: new Date(),
        },
      });
    } catch (e) {
      throw new RpcException(new ConflictException('Product was duplicate'));
    }
  }
}
