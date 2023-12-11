/*I Route Guards consentono di controllare la navigazione in un'applicazione Angular. 
I Route Guards sono usati per proteggere le rotte, 
garantendo che l'utente sia autorizzato a navigare verso una determinata pagina.
Possono essere utilizzati in diversi scenari e fornire un controllo granulare sulla navigazione dell'utente.
I principali sono: */

/*CanActivate:
    -Scopo: Il guard CanActivate determina se una route può essere attivata.
            Controlla l'accesso alle route sincronamente.
    -Caso d'uso: È comunemente usato per il controllo dell'autenticazione dell'utente.*/

    @Injectable({
        providedIn: 'root',
      })
      export class AuthGuard implements CanActivate {
        canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
          //Logica di autenticazione
          return true; //o false se l'utente non è autenticato
        }
      }

    /*CanActivateChild:
        -Scopo: Simile a CanActivate, ma applicato alle rotte figlie di una route.
        -Caso d'uso: Può essere utilizzato per proteggere un'intera sezione dell'applicazione che contiene rotte figlie.*/

    @Injectable({
        providedIn: 'root',
    })
        export class AuthGuard implements CanActivateChild {
        canActivateChild(
          route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot
         ): boolean {
        // Logica di autenticazione
        return true; // o false se l'utente non è autenticato
        }
        }


    /*CanDeactivate:
        -Scopo: Determina se una route può essere disattivata, ad esempio durante la navigazione indietro.
        -Caso d'uso: Può essere utilizzato per confermare se l'utente desidera davvero abbandonare una pagina
                    con modifiche non salvate.*/
        
                    export interface CanDeactivateComponent {
                        canDeactivate: () => boolean | Observable<boolean>;
                      }
                      
                      @Injectable({
                        providedIn: 'root',
                      })
                      export class CanDeactivateGuard
                        implements CanDeactivate<CanDeactivateComponent>
                      {
                        canDeactivate(
                          component: CanDeactivateComponent,
                          currentRoute: ActivatedRouteSnapshot,
                          currentState: RouterStateSnapshot,
                          nextState?: RouterStateSnapshot
                        ): boolean | Observable<boolean> {
                          return component.canDeactivate ? component.canDeactivate() : true;
                        }
                      }

    /*CanLoad:
        -Scopo: Determina se un modulo può essere caricato in modo asincrono.
        -Caso d'uso: Può essere utilizzato per impedire il caricamento di moduli non autorizzati.*/
    
        @Injectable({
            providedIn: 'root',
          })
          export class AuthLoadGuard implements CanLoad {
            canLoad(route: Route, segments: UrlSegment[]): boolean {
              //Logica di autenticazione 
              return true; // o false se l'utente non è autenticato
            }
          }

    /*Resolve:
        -Scopo: Il resolver (Resolve) viene utilizzato per recuperare dati asincroni 
                prima che una route venga attivata.Assicura che tutti i dati necessari 
                siano disponibili prima di renderizzare il componente associato alla route.

        -Caso d'uso: Utile quando è necessario recuperare dati da un servizio o risolvere 
                     dipendenze prima di visualizzare una pagina.*/

    @Injectable({
        providedIn: 'root',
    })
        export class DataResolver implements Resolve<MyData> {
        resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MyData> {
        // Recupera i dati dal servizio o da altre fonti
        return this.dataService.getData();
        }
     }


     //esempio impostazioni delle rotte:

    import { AuthGuard } from './auth.guard';
    import { AuthChildGuard } from './auth-child.guard';
    import { CanDeactivateGuard } from './can-deactivate.guard';
    import { AuthLoadGuard } from './auth-load.guard';
    import { DataResolver } from './data.resolver';

    // Definizione delle rotte
    const routes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard], // CanActivate per la route principale
        canActivateChild: [AuthChildGuard], // CanActivateChild per le rotte figlie
    },
    {
        path: 'admin',
        loadChildren: 'app/admin/admin.module#AdminModule',
        canLoad: [AuthLoadGuard], // CanLoad per il caricamento del modulo in modo asincrono
    },
    {
        path: 'details/:id',
        component: DetailsComponent,
        canDeactivate: [CanDeactivateGuard], // CanDeactivate per la disattivazione della route
        resolve: {
        resolvedData: DataResolver, // Resolve per il recupero di dati prima della navigazione
        },
    },
    // ... altre definizioni di rotte
    ];

    @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    })
    export class AppRoutingModule {}

    /*CanActivate e CanActivateChild:
        -AuthGuard e AuthChildGuard controllano l'autenticazione dell'utente. 
         Se l'utente non è autenticato, la navigazione alla route principale 
         o alle rotte figlie sarà impedita.

      CanLoad:
        -AuthLoadGuard impedisce il caricamento del modulo associato alla route "admin"
         se l'utente non è autenticato.

      CanDeactivate:
        -CanDeactivateGuard impedisce la disattivazione della route "details/:id"
         se ci sono modifiche non salvate nel componente.

      Resolve:
        -DataResolver viene utilizzato per recuperare dati asincroni prima di navigare alla route "details/:id".
         I dati recuperati saranno disponibili nel componente DetailsComponent attraverso il parametro resolvedData. */


    /*Utilizzo di JSON Web Tokens (JWT):
        Il JWT è spesso usato per consentire agli utenti di accedere a risorse protette nel backend.
        Se il token è scaduto, è un segnale che l'utente dovrebbe essere considerato "non autenticato".*/

    //installare angular2-jwt
    npm install --save @auth0/angular-jwt

    /*Creazione di un Servizio di Autenticazione:
        Nel servizio di autenticazione (AuthService), 
        viene creato un metodo isAuthenticated() che controlla se l'utente è autenticato. 
        Per un'autenticazione stateless con JWT, l'utente è considerato autenticato se il token non è scaduto. 
        Si utilizza la classe JwtHelperService dal pacchetto @auth0/angular-jwt per effettuare questa verifica. */

    import { Injectable } from '@angular/core';
    import { JwtHelperService } from '@auth0/angular-jwt';

    @Injectable()
    export class AuthService {
    constructor(public jwtHelper: JwtHelperService) {}

    public isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !this.jwtHelper.isTokenExpired(token);
    }
    }

    /*Creazione di un Servizio per il Route Guard:
        Viene creato un nuovo servizio (AuthGuardService) che implementa l'interfaccia CanActivate.
        Questo servizio si occupa di controllare se l'utente è autenticato. 
        Se l'utente non è autenticato, viene reindirizzato alla pagina di login.*/

    import { Injectable } from '@angular/core';
    import { Router, CanActivate } from '@angular/router';
    import { AuthService } from './auth.service';

    @Injectable()
    export class AuthGuardService implements CanActivate {
    constructor(public auth: AuthService, public router: Router) {}

    canActivate(): boolean {
        if (!this.auth.isAuthenticated()) {
        this.router.navigate(['login']);
        return false;
        }
        return true;
    }
    }

    /*Applicazione del Route Guard alle Rotte:
        Il servizio AuthGuardService può essere utilizzato 
        come guardia per proteggere l'accesso a specifiche rotte.
        Nel file di definizione delle rotte (app.routes.ts), 
        il route guard è associato alla rotta /profile. */
    
    import { Routes, CanActivate } from '@angular/router';
    import { ProfileComponent } from './profile/profile.component';
    import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';

    export const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
    ];

    /*La rotta /profile ora include la configurazione canActivate: [AuthGuard].
      Ciò significa che ogni volta che qualcuno cerca di accedere a questa rotta, 
      la guardia AuthGuard verrà eseguita. Se l'utente è autenticato, verrà consentito
      l'accesso alla rotta; altrimenti, verrà reindirizzato alla pagina di login. */


    //Verificare il Ruolo di un utente:

    //Installare la libreria jwt-decode, che consente di decodificare il payload di un token JWT.
    npm install --save jwt-decode

    /*Creazione di RoleGuardService:
        Creazione di un nuovo servizio RoleGuardService 
        che implementa l'interfaccia CanActivate.
        Questo servizio è responsabile di verificare
        se un utente ha il ruolo richiesto per accedere 
        a una determinata rotta. */

    import { Injectable } from '@angular/core';
    import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
    import { AuthService } from './auth.service';
    import decode from 'jwt-decode';

    @Injectable()
    export class RoleGuardService implements CanActivate {
    constructor(public auth: AuthService, public router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        // Ottiene il ruolo atteso dalla configurazione della rotta
        const expectedRole = route.data.expectedRole;

        // Recupera il token dal localStorage
        const token = localStorage.getItem('token');

        // Decodifica il token per ottenere il payload
        const tokenPayload = decode(token);

        // Verifica se l'utente è autenticato e ha il ruolo atteso
        if (!this.auth.isAuthenticated() || tokenPayload.role !== expectedRole) {
        this.router.navigate(['login']);
        return false;
        }

        // Se l'utente è autenticato e ha il ruolo atteso, permetti la navigazione
        return true;
    }
    }

    /*Utilizzo di RoleGuardService nelle rotte:
        Si può adesso utilizzare RoleGuardService per proteggere specifiche rotte. 
        Ad esempio, supponendo di voler proteggere la rotta /admin e richiedere che
        solo gli utenti con il ruolo 'admin' possano accedere:*/

    import { Routes } from '@angular/router';
    import { AdminComponent } from './admin/admin.component';
    import { AuthGuardService as AuthGuard } from './auth/auth-guard.service';
    import { RoleGuardService as RoleGuard } from './auth/role-guard.service';

    export const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [RoleGuard],
        data: {
        expectedRole: 'admin'
        }
    },
    { path: '**', redirectTo: '' }
    ];

    /*In questo esempio, la rotta /admin utilizza RoleGuardService come guardia di navigazione.
      Nel campo data, viene passato un oggetto con la chiave expectedRole impostata su 'admin',
      indicando che solo gli utenti con il ruolo 'admin' possono accedere a questa rotta. 
      Se un utente non è autenticato o non ha il ruolo richiesto, verrà reindirizzato alla pagina di login.*/


    //Facilmente "Hackerabile?"
    /*sebbene sia tecnicamente possibile modificare il token, 
      qualsiasi modifica al payload invaliderebbe la firma del JWT. 
      Di conseguenza, anche se un utente riuscisse a manipolare il token, 
      non sarebbe in grado di accedere alle risorse protette poiché 
      il server rifiuterebbe un token con firma non valida.*/


    //"Bloccare completamente i percorsi"
    /*Angular offre possibilità interessanti attraverso il routing asincrono.
      L'idea è che l'utilizzo del routing asincrono potrebbe aggiungere ulteriori
      strati di sicurezza o complessità per mitigare eventuali rischi nella protezione delle rotte.*/

    //Conclusioni
    /*Sebbene Angular Route Guards sia una buona soluzione 
      per proteggere l'accesso alle rotte lato client, 
      nulla sul lato client può essere completamente protetto
      e qualsiasi dato sensibile dovrebbe essere mantenuto sul server. 
      Anche se un utente riuscisse ad accedere a una route non autorizzata, 
      il server respingerebbe richieste non valide, 
      garantendo che l'utente non possa accedere a dati o risorse non autorizzate. 
      La sicurezza dovrebbe però essere implementata in modo bilanciato, 
      combinando misure lato client con pratiche di sicurezza robuste sul lato server.*/

