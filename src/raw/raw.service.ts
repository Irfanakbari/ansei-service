import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateRawDto } from './dto/create-raw.dto';
import { UpdateRawDto } from './dto/update-raw.dto';
import { PrismaService } from 'nestjs-prisma';
import { RpcException } from '@nestjs/microservices';
import * as moment from 'moment-timezone';

@Injectable()
export class RawService {
  constructor(private prismaService: PrismaService) {}

  async create(createRawDto: CreateRawDto[]) {
    try {
      // Konversi format tanggal dan sesuaikan zona waktu untuk setiap objek dalam array
      const formattedCreateRawDtos = createRawDto.map((dto) => {
        Logger.log(moment.utc(dto.deliveryDate).tz('Asia/Jakarta').toDate());
        return {
          ...dto,
          date: moment.utc(dto.date).tz('Asia/Jakarta').toDate(),
          deliveryDate: moment
            .utc(dto.deliveryDate)
            .tz('Asia/Jakarta')
            .toDate(),
        };
      });
      // Buat data di database menggunakan Prisma
      return this.prismaService.rawData.createMany({
        data: formattedCreateRawDtos,
      });
    } catch (e) {
      Logger.log('Logger bos: ' + e);
      throw new RpcException(new ConflictException('Raw Data was duplicate'));
    }
  }

  async findAll(options: any) {
    try {
      const datas = await this.prismaService.rawData.findMany({
        skip: (options.pageNumber - 1) * parseInt(options.pageSize), // Menghitung berapa data yang harus dilewati (skip)
        take: parseInt(options.pageSize), // Mengambil jumlah data sebanyak yang diinginkan (limit)
      });
      const count = await this.prismaService.rawData.count();
      return {
        data: datas,
        totalData: count,
        limit: options.pageSize,
        currentPage: options.pageNumber,
      };
    } catch (e) {
      throw new RpcException(new ConflictException('There was problem'));
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} raw`;
  }

  update(id: number, updateRawDto: UpdateRawDto) {
    return `This action updates a #${id} raw`;
  }

  remove() {
    try {
      return this.prismaService.rawData.deleteMany({});
    } catch (e) {
      throw new RpcException(new ConflictException('There was problem'));
    }
  }
}
