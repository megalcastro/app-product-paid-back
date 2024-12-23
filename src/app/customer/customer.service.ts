import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}


  async create(createCustomerDto: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async findOne(id: number): Promise<Customer> {
    return this.customerRepository.findOneBy({ id });
  }

  async update(id: number, updateCustomerDto: Partial<Customer>): Promise<Customer> {
    await this.customerRepository.update(id, updateCustomerDto);
    return this.customerRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.customerRepository.delete(id);
  }
}
