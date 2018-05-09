import { Injectable } from '@angular/core';

import { Metadata, Settings } from '../models/unit.model';

@Injectable()
export class MethodsService {
    settings: Settings;

  	constructor() {
        this.settings = {
            start_value: 1000000,
            start_date: [2016, 1, 1],
            end_date: [2016, 11, 1],
            allocation: [1],
            target_stocks: ['KEYS'],
            benchmark: 'SPY'
        }
    }
}

