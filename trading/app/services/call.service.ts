import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { environment } from '../../environments/environment';

@Injectable()
export class CallService {
  	baseUrl = environment.apiEndpoint + '/api';
	flag: boolean;

	constructor(private http: Http, private router: Router) {

  	}

  	checkForCommonError(err: any) {
		this.flag = false;
  		if (err.status && err.status >= 500) {
  			console.log("Server side error.");
  		} else if (err.status && err.status >= 400) {
  			console.log("Bad request.");
  		} else if (err.status && err.status >= 300) {
  			console.log("Redirection error.")
		  }
		alert('Invalid Input');
  		return Observable.throw(err);
  	}

  	get(url) {
    	let headers = this.createRequestHeaders();
    	return this.http
      		.get(this.baseUrl + '/' + url, { body: '', headers: headers } )
      		.catch(err => this.checkForCommonError(err));
  	}

  	delete(url) {
    	let headers = this.createRequestHeaders();
    		return this.http
      		.delete(this.baseUrl + '/' + url, { body: '', headers: headers } )
      		.catch(err => this.checkForCommonError(err));
  	}

  	post(url, entity: any = '') {
		let headers = this.createRequestHeaders();
    	return this.http
      		.post(this.baseUrl + '/' + url, entity, { headers: headers } )
      		.catch(err => this.checkForCommonError(err));
  	}

  	put(url, entity: any = '') {
    	let headers = this. createRequestHeaders();
    	return this.http
      		.put(this.baseUrl + '/' + url, entity, { headers: headers } )
      		.catch(err => this.checkForCommonError(err));
  	}

  	private addContentTypeHeader(headers: Headers) {
    	headers.append('Content-Type', 'application/json');
  	}

  	private createRequestHeaders() {
    	let result = new Headers();
    	this.addContentTypeHeader(result);
    	return result;
  	}
}