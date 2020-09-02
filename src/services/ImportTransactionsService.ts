import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { In, getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  csvFilename: string;
}

interface CSVRequest {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({csvFilename}: Request): Promise<Transaction[]> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository =  getRepository(Category);


    const csvFilePath = path.resolve(__dirname,'..', '..', 'tmp', csvFilename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVRequest[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
        const [title, type, value, category] = line.map((cell: string) =>
          cell.trim()
        );

        if(!title || !type || !value) return;

        categories.push(category);

        transactions.push({title, type, value, category});

    });

    await new Promise(resolve => { parseCSV.on('end', resolve) });

    const existsCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    });

    const existentCategoriesTitles = existsCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories.
    filter(category =>  !existentCategoriesTitles.includes(category))
    .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
      title,
    })))

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existsCategories];

    const createdTransactions =  transactionsRepository.create(
      transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: finalCategories.find(
            category => category.title === transaction.category
          ),
      })));

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
