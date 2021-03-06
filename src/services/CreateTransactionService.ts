import  { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';



interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if(type == 'outcome' && balance.total < value) {
      throw new AppError('Insufficient balance to carry out this transaction.', 400);
    }

    let currentCategory = await categoryRepository.findOne({where: {title: category}});

    if(!currentCategory) {
      currentCategory = categoryRepository.create({
        title: category
      });

      await categoryRepository.save(currentCategory);
    }

      const transaction = transactionsRepository.create({title, value, type, category: currentCategory});

      await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
