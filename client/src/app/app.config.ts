import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthInterceptor } from './services/auth.interceptor';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routes';

export const appConfig = {
  providers: [
    importProvidersFrom(
      HttpClientModule,
      JwtModule.forRoot({
        config: {
          tokenGetter: () => {
            // Check if 'window' is defined to ensure we're in the browser
            if (typeof window !== 'undefined') {
              return localStorage.getItem('access_token');
            }
            return null;
          },
          allowedDomains: ["localhost:8001"],
          disallowedRoutes: [], // Add routes if necessary
        },
      }),
      RouterModule,
      AppRoutingModule
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};