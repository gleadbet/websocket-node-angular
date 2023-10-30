import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';         // Allow routing to various pages
import { AppComponent } from './app.component';
import { TagListComponent} from './tags/tag-list.component';
import { TagGageComponent } from './tags/tag-gage.component';    // Import the tags componet we created
import { WelcomeComponent } from './home/welcome.component';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { SocketService } from './shared/socket.service';
import { FormsModule } from '@angular/forms';



const config: SocketIoConfig = { url: 'http://localhost:5002' };

@NgModule({
  declarations: [
    AppComponent,
    TagListComponent,                                    // List tags and their values
    TagGageComponent,                                    // Refer to the tag-gage.componet (Gages)
    WelcomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,

    SocketIoModule.forRoot(config),
    RouterModule.forRoot([                                // This allows routing of pages and
    { path: 'welcome', component: WelcomeComponent },
    { path: 'tags', component: TagListComponent },
    { path: 'gage', component: TagGageComponent },
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: '**', redirectTo: 'welcome', pathMatch: 'full' }
  ]),
  FormsModule
  ],

  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
