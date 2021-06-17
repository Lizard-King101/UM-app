import { Component } from '@angular/core';
import { SearchService } from '../_services/search.service';
import { SocketService } from '../_services/socket.service';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
    query: string;
    pastQuery: string;
    searching: boolean = false;
    results: any[] = [];
    nextPageToken: string;
    constructor(private yt: SearchService, private socket: SocketService) {
        
    }

    submitSearch() {
        this.searching = true;
        this.pastQuery = this.query;
        this.results = [];
        this.yt.search(this.query).subscribe((data) => {
            this.searching = false;
            console.log(data);
            this.results = data.items;
            this.nextPageToken = data.nextPageToken ? data.nextPageToken : undefined;
        })
    }

    loadMore() {
        this.searching = true;
        this.yt.nextPage(this.pastQuery, this.nextPageToken).subscribe((data) => {
            this.searching = false;
            console.log(data);
            
            this.results = this.results.concat(data.items);
            this.nextPageToken = data.nextPageToken ? data.nextPageToken : undefined;
        })
    }

}
