import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {

    const transactions = await this.find();

    const balance = transactions.reduce((prev, b) => {

      if(b.type === 'income') {
        prev.income += Number(b.value);
        prev.total += Number(b.value);
      }

      if(b.type === 'outcome') {
        prev.outcome += Number(b.value);
        prev.total -= Number(b.value);
      }

      return prev;
    }, {
      income: 0,
      outcome:0,
      total: 0
    });

    return balance;

  }
}

export default TransactionsRepository;
