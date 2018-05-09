import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { CallService } from './call.service';
import { Metadata, Settings } from '../models/unit.model';
import { dummyData } from './mockData';

@Injectable()
export class ProjectService {
	currentPlotData: BehaviorSubject<any> = new BehaviorSubject<any>('{}');

  	constructor(private callService: CallService) {

  	}

  	postForm(url: String, data: Settings) {
  		return this.callService.post(url, data).subscribe(rsp => {
		  this.currentPlotData.next(rsp._body);
		  this.callService.flag = false;
		});
	}

	getMetadata(): Observable<Metadata> {
		return this.callService
			.get('metadata')
			.map(rsp => rsp.json() as Metadata);
	}

}
