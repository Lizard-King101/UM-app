import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

const API_KEY = "AIzaSyB0U-qIQU65Gla41zbu6dCqVVxjCIGP7vE";
const URL = "https://www.googleapis.com/youtube/v3/search";
@Injectable()
export class SearchService{
    constructor(private http: HttpClient) { }
    search(query: string): Observable<any> {
        let url = `${URL}?q=${query}&key=${API_KEY}&part=snippet&type=video&maxResults=20`;
        return this.http.get(url)
        .pipe(
            map((response: any) => response)
        );
    }

    nextPage(query: string, nextPageToken: string) {
        let url = `${URL}?q=${query}&pageToken=${nextPageToken}&key=${API_KEY}&part=snippet&type=video&maxResults=10`;
        return this.http.get(url)
        .pipe(
            map((response: any) => response)
        );
    }
}