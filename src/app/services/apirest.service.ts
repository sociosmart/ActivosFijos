import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpResponse  } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
export interface ApiResult {
  Mensaje:any;
  Data:any[];
  Estatus:any;
}


export interface Balance {
  total: number;
}

export interface GiftCardBalance {
  amount: number;
}

export interface PresetPump {
  amount: number;
  id: string;
  total_liter: number;
}
@Injectable({
  providedIn: 'root',
})
export class ApirestService {
  private cerrarlasdosSubject = new Subject<void>();

  cerrarlasdos$ = this.cerrarlasdosSubject.asObservable();

  cerrarlasdos() {
    this.cerrarlasdosSubject.next();
  }
  apiSocioSmart: any;

  constructor(private http: HttpClient, private storage: Storage) {
    // this.apiSocioSmart = environment.baseUrl;
  }

  // getApiURL(){
  //   this.storage.create();
  //     this.storage.get('apisociosmart').then((apisociosmart) => {
  //       this.apiSocioSmart=apisociosmart;
  //     });
  //     console.log('url de api: ',this.apiSocioSmart);
  // }

  getTopRatedMovies(page = 1): Observable<ApiResult> {
    return this.http.get<ApiResult>(`${environment.baseUrl}rest/operacion`);
  }
  obtenerconfiguuid1(
    uuid: any,
    modelo: any,
    plataforma: any,
    estacion: any
  ): Observable<ApiResult> {
    console.log(
      `${environment.baseUrl}rest/operacion?uuid=${uuid}&modelo=${modelo}&plataforma=${plataforma}&estacion=${estacion}`
    );
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?uuid=${uuid}&modelo=${modelo}&plataforma=${plataforma}&estacion=${estacion}`
    );
  }

  GetBalance(token: string, externalGasStationId: string): Observable<Balance> {
    return this.http.get<Balance>(
      `${environment.debitUrl}/api/v1/deposits/balance?external_gas_station_id=${externalGasStationId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
  }

   PrefijaBomba($Cantidad:any,$TipoCombustible:any,$Descuento:any,$Posicion:any,$PresetCode:any,$tipoCantidadVol:any,$ulr:any) : Observable<ApiResult> {
        //let apiUrl = `${$ulr}/General/Prefijar?json={"bomba": ${$Posicion},"cantidad":${$Cantidad},"clave":"12345","combustible":${$TipoCombustible},"preautorizar":"${$PresetCode}","serie":"","tipo":"${$tipoCantidadVol}","validarSerie":true,"descuento":${$Descuento}}`;
        // Configurar las cabeceras1
   let apiUrl = `${$ulr}/General/Prefijar?json={"bomba":${$Posicion},"cantidad":${$Cantidad},"clave":"12345","combustible":${$TipoCombustible},"preautorizar":"${$PresetCode}","serie":"","tipo":"${$tipoCantidadVol}","validarSerie":true,"descuento":${$Descuento}}`;
   // let apiUrl='';
        console.log(apiUrl);
        return this.http.post<ApiResult>(`${apiUrl}`, null);
    }
  
    EstatusBomba($Posicion:any,$ulr:any) : Observable<any> {
    
      let apiUrl = `${$ulr}/socio_smart/estado_bomba?json={"num_bomba":"${$Posicion}"}`;
      console.log("Entra",apiUrl);
      // Configurar las cabeceras
   console.log(apiUrl);
      return this.http.post<any>(`${apiUrl}`,null);
  }
  CambiaFormaDePago($Posicion: any,$ulr:any,$selectedOption:any): Observable<any> {
    let apiUrl = `${$ulr}/Ticket/Combustible?json={"validarSerie":true,"promotor":"12345","serie":"630C574332F22E","bomba":${$Posicion},"tipoPagoCV":${$selectedOption},"clienteID":0,"cuentaID":0,"lealtadTarjeta":"","lealtadTipo":0,"productos":"","tipoVenta":3}`;
    console.log("Entra",apiUrl);
    // Configurar las cabeceras
    console.log(apiUrl);
    return this.http.post<any>(`${apiUrl}`,null);
  }
  TraeFormaDePago($ulr:any) : Promise<any> {
    let apiUrl = `${$ulr}/Configuraciones/obtenerFormasPagoCV`;
    return this.http
    .get(apiUrl)
    .toPromise()
    .then((response) => {
      var data = JSON.stringify(response, null, 2);
      return JSON.parse(data);
    });
    }
  
  MakePayment(
    gasStationId: string,
    employeeId: string,
    employeeNip: string,
    data: object
  ): Observable<PresetPump> {
    console.log( `${environment.autopagoUrl}/api/v1/payments/create-intent-operation`);
    console.log(data);
    return this.http.post<PresetPump>(
      `${environment.autopagoUrl}/api/v1/payments/create-intent-operation`,
      JSON.stringify(data),
      {
        headers: {
          'X-GAS-STATION-ID': gasStationId,
          'X-EMPLOYEE-ID': employeeId,
          'X-EMPLOYEE-NIP': employeeNip,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  QuemaPayment(
    id:any,
    Amount:number
  ): Observable<PresetPump> {
    let body: any = {
      "amount_charged":Amount,
      "type": "served"}
    console.log(`https://qa-payments.smartgasautopago.xyz/api/v1/payments/${id}/events`);
    console.log(body);
    return this.http.post<PresetPump>(
      `https://qa-payments.smartgasautopago.xyz/api/v1/payments/${id}/events`,
    body,
      {
        headers: {
          'APP-KEY': 'e0d99184-2658-4900-b73a-b521f10808ba',
          'API-KEY': 'e6a1d9b7-e9e1-4e36-9c05-160880087810',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  GetGiftCardBalance(
    giftCard: string,
    pv: string
  ): Observable<GiftCardBalance> {
    return this.http.get<GiftCardBalance>(
      `${environment.debitUrl}/api/v1/gift-cards/by-key/${giftCard}?external_gas_station_id=${pv}`
    );
  }

  GetEstaciones(): Observable<ApiResult> {
    return this.http.get<ApiResult>(`${environment.baseUrl}rest/operacion`);
  }

  getEstatus($user: any, $contrakey: any, $Token: any): Observable<ApiResult> {
    console.log(
      `${environment.baseUrl}rest/operacion?user=${$user}&contrakey=${$contrakey}&Token=${$Token}`
    );
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?user=${$user}&contrakey=${$contrakey}&Token=${$Token}`
    );
  }

  GetVersionActual(pv: any, version: any, uuid: any): Observable<ApiResult> {
   console.log(`${environment.baseUrl}rest/operacion?v=2&pv=${pv}&versiontrabaja=${version}&uuid=${uuid}`);
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?v=2&pv=${pv}&versiontrabaja=${version}&uuid=${uuid}`
    );
  }

  getUsers(
    $id: any,
    $user: any,
    $pass: any,
    pv: any,
    tokenn: any
  ): Observable<ApiResult> {
    console.log('Invoca');
    console.log(
      `${environment.baseUrl}rest/operacion?id=${$id}&val1=${$user}&val2=${$pass}&token=${tokenn}&pv=${pv}`
    );
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?id=${$id}&val1=${$user}&val2=${$pass}&token=${tokenn}&pv=${pv}`
    );
  }

  registro(
    $usuario: any,
    $contra: any,
    $email: any,
    Empleado: any,
    Nip: any,
    Pv: any
  ): Observable<ApiResult> {
    let body = JSON.stringify({
      usuario: $usuario,
      email: $email,
      password: $contra,
      Empleado: Empleado,
      Nip: Nip,
      Pv: Pv,
    });
    console.log('body de registro: ', body);
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    // console.log(body);
    console.log(`${environment.baseUrl}rest/registro?Estacion`);
    return this.http
      .post<ApiResult>(`${environment.baseUrl}rest/registro?Estacion`, body)
      .pipe(
        tap((data: any) => {
          console.log('Desde apirest.service: ', data);
        })
      );
  }

  TucargaVahle($uuid: any, $Token: any, $pv: any): Observable<ApiResult> {
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?uuid=${$uuid}+"&token=${$Token}+"&pv=${$pv}+"&TucargaVale=1"`
    );
  }

  Validausuario(
    $id: any,
    $di: any,
    $yi: any,
    GRUPO: any
  ): Observable<ApiResult> {
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?usr=${$id}&pw=${$di}&cre=${$yi}&pv=${GRUPO}`
    );
  }

  async Refrescatoken($id: any): Promise<any> {
    const UUID = await this.storage.get('UUID');
    const apiUrl = `${environment.baseUrl}rest/operacion?token=${$id}&uuid=${UUID}`;
    console.log(apiUrl);
    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);

        // here i do some stuff about the data

        return JSON.parse(data);
      });
  }

  async Vertabla($id: any, $bomba: any, $pv: any): Promise<string> {
    
    let val1 = await this.storage.get('host');
    let token = await this.storage.get('Token');
    let UUID = await this.storage.get('UUID');
    let apiUrl = `${val1}/Vertabla/${$id}/${$bomba}/${$pv}/${token}/${UUID}`;
    // Configurar las cabeceras
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://192.168.68.153:4200/',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
    });
    const options = { headers: headers };
    console.log(apiUrl);
    return this.http
      .get(apiUrl, options)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }
 async Validaservicio(): Promise<string> {
    const val1 = await this.storage.get('host');
    const apiUrl = `${val1}/`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const options = {
      headers,
      observe: 'response' as const,
      responseType: 'text' as const // 👈 Importante si el servicio no devuelve JSON
    };

    try {
      const response = await firstValueFrom(this.http.get(apiUrl, options));

      if (response.status === 200) {
        return 'Activo';
      } else {
        return 'SinSeñal';
      }

    } catch (error: any) {
      console.error('❌ Error al llamar al servicio:', error);
      return 'SinSeñal';
    }
  }

  // Vertabla($id: any, $bomba: any, $pv: any) { return new Promise(async resolve => {
  //     let host = await this.storage.get('host');
  //     let token = await this.storage.get('Token');
  //     let UUID = await this.storage.get('UUID');
  //     let apiUrl = `${host}/Vertabla/${$id}/${$bomba}/${$pv}/${token}/${UUID}`;

  //     let headers = new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Access-Control-Allow-Origin': 'http://192.168.68.153:4200/',
  //       'Access-Control-Allow-Methods': 'POST',
  //       'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
  //     });
  //     const options = { headers: headers };

  //       console.log("Invoca Vertabla");
  //      console.log(apiUrl);
  //     this.http.get(apiUrl, options).subscribe(data => {
  //       var response = JSON.stringify(data, null, 2);
  //       resolve(response);
  //     }, err => {
  //       resolve(err);
  //     });
  // });
  // }

  //(data,this.empleado,this.TipoBd, apiSocioSmart,this.Campana1
  
  tablainsertar(
    arreglo: any,
    $di: any,
    $id: any,
    apiq: any,
    $cve: any
  ): Observable<boolean> {
    try {
      const body = JSON.stringify([arreglo]);

      console.log(body);

      // Configurar las cabeceras
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://192.168.68.153:4200/',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
      });

      const options = { headers: headers };

      // console.log(apiq + "/tablainsertar/" + $di + "/" + $id);
      console.log(
        'URL de campañas: ',
        `${environment.baseUrl}rest/operacion?user=${$di}&bd=${$id}&campana=${$cve}`
      );

      return this.http
        .post(
          `${environment.baseUrl}rest/operacion?user=${$di}&bd=${$id}&campana=${$cve}`,
          body
        )
        .pipe(
          tap((response: any) => {
            if (response[0]['status'] === 'ok') {
              return true;
            } else {
              return false;
            }
          })
        );
    } catch (error) {
      // Manejar el error si es necesario
      console.error(error);
      return new Observable<boolean>(); // Devuelve un observable vacío o maneja el error según tu lógica.
    }
  }

  TraeSorteoVigente($ciudad: any): Observable<ApiResult> {
    console.log(
      `${environment.baseUrl}rest/operacion?Sorteo=true&ciudad=${$ciudad}`
    );
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?Sorteo=true&ciudad=${$ciudad}`
    );
  }

  getCampana($uuid: any, $Token: any): Observable<ApiResult> {
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?uuid=${$uuid},+"&token=${$Token}`
    );
  }

  sorteolocal($uuid: any, $Token: any, $pv: any): Observable<ApiResult> {
    console.log(
      `${environment.baseUrl}rest/operacion?uuid=${$uuid}&token=${$Token}&sorteolocal=1&pv=${$pv}`
    );
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?uuid=${$uuid}&token=${$Token}&sorteolocal=1&pv=${$pv}`
    );
  }

  TucargaVale($uuid: any, $Token: any, $pv: any): Observable<ApiResult> {
    //console.log(`${environment.baseUrl}rest/operacion?uuid=${$uuid}&token=${$Token}&pv=${$pv}&TucargaVale=1`);
    console.log(`${environment.baseUrl}rest/operacion?uuid=${$uuid}&token=${$Token}&pv=${$pv}&TucargaVale=1`);
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?uuid=${$uuid}&token=${$Token}&pv=${$pv}&TucargaVale=1`
    );
  }

  ticketInvitacion(
    $pv: any,
    IpImpresora: any,
    NombreImpresora: any,
    host: any,
    tipo: any,
    puerto: any,
    PV: any,
    Titulo: any,
    Qr: any,
    Mensaje: any,
    Footer: any
  ) {
    let body = JSON.stringify([
      {
        CvePv: $pv,
        IpImpresora: IpImpresora,
        NombreImpresora: NombreImpresora,
        Host: host,
        Tipo: tipo,
        Puerto: puerto,
        Cre: PV,
        Titulo: Titulo,
        Qr: Qr,
        Mensaje: Mensaje,
        Footer: Footer,
      },
    ]);
    console.log(body);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
    console.log(host + '/ImpresionQr');

    return this.http.post(`${host}/ImpresionQr`, body).pipe(
      tap((response: any) => {
        console.log(response);
        if (response[0]['status'] === 'ok') {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  ticketInvitacionEs(
    $pv: any,
    IpImpresora: any,
    NombreImpresora: any,
    host: any,
    tipo: any,
    puerto: any,
    PV: any,
    Titulo: any,
    Qr: any,
    Mensaje: any,
    Footer: any
  ) {
    let body = JSON.stringify([
      {
        CvePv: $pv,
        IpImpresora: IpImpresora,
        NombreImpresora: NombreImpresora,
        Host: host,
        Tipo: tipo,
        Puerto: puerto,
        Cre: PV,
        Titulo: Titulo,
        Qr: Qr,
        Mensaje: Mensaje,
        Footer: Footer,
      },
    ]);
    console.log(body);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
    console.log(host + '/ImpresionQr');

    return this.http.post(`${host}/ImpresionQr`, body).pipe(
      tap((response: any) => {
        console.log(response);
        if (response[0]['status'] === 'ok') {
          return true;
        } else {
          return false;
        }
      })
    );
  }

  async getcupones(
    $cve_Ciudad: any,
    $Tipo: any,
    $Puntos: any
  ): Promise<ApiResult> {
    const val1 = await this.storage.get('Token');
    const apiUrl = `${environment.baseUrl}rest/operacion?pv=${$cve_Ciudad}&tipo=${$Tipo}&puntos=${$Puntos}&token=${val1}`;
    console.log(apiUrl);

    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  postValeop(
    $pv: any,
    $cliente: any,
    $cantidad: any,
    $prod: any,
    $user: any,
    $token: any,
    $ciudad: any,
    $uuid: any,
    $usuario: any,
    $nip: any
  ) {
    let body = JSON.stringify({});
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
console.log(  `${environment.baseUrl}rest/operacion?pv=${$pv}&cliente=${$cliente}&prod=${$prod}&token=${$token}&ciudad=${$ciudad}&uuid=${$uuid}&empleado=${$usuario}&nip=${$nip}`);
console.log(body); 
return this.http
      .post(
        `${environment.baseUrl}rest/operacion?pv=${$pv}&cliente=${$cliente}&prod=${$prod}&token=${$token}&ciudad=${$ciudad}&uuid=${$uuid}&empleado=${$usuario}&nip=${$nip}`,
        body
      )
      .pipe(
        tap((response: any) => {
          console.log(response);
          if (response[0]['status'] === 'ok') {
            return true;
          } else {
            return false;
          }
        })
      );
  }

  async getValeCanjeGas($id: any): Promise<ApiResult> {
    let UUID = await this.storage.get('UUID');
    let Token = await this.storage.get('Token');
    let host = await this.storage.get('host');
    const apiUrl = `${environment.baseUrl}rest/operacion?Ticket=${$id}&token=${Token}&uuid=${UUID}`;
    console.log(apiUrl);

    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        console.log('YA SALIO EL TICKET');
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  ticket(
    $clientevale: any,
    $vales: any,
    $foliovale: any,
    $pv: any,
    $tipo: any,
    IpImpresora: any,
    NombreImpresora: any,
    host: any,
    tipo: any,
    puerto: any,
    PV: any
  ) {
    let body = $vales;
    console.log(body);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
    console.log('Imprime Ticket');
    console.log(
      `${host}/ticket/${$clientevale}/${$foliovale}/${$pv}/${$tipo}/${IpImpresora}/${NombreImpresora}/${tipo}/${puerto}/${PV}`
    );
    return this.http
      .post(
        `${host}/ticket/${$clientevale}/${$foliovale}/${$pv}/${$tipo}/${IpImpresora}/${NombreImpresora}/${tipo}/${puerto}/${PV}`,
        body
      )
      .pipe(
        tap((response: any) => {
          console.log(response);
          if (response[0]['status'] === 'ok') {
            return true;
          } else {
            return false;
          }
        })
      );
  }

  async getValepv($pv: any): Promise<ApiResult> {
    let UUID = await this.storage.get('UUID');
    let token = await this.storage.get('Token');
    console.log(
      `${environment.baseUrl}rest/operacion?GetValePvDia=true&pv=${$pv}&token=${token}&uuid=${UUID}`
    );

    const apiUrl = `${environment.baseUrl}rest/operacion?GetValePvDia=true&pv=${$pv}&token=${token}&uuid=${UUID}`;
    console.log(apiUrl);

    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  reimpresionticketEscoserra(
    $vales: any,
    $foliovale: any,
    $clientevale: any,
    $pv: any,
    $tipo: any,
    IpImpresora: any,
    NombreImpresora: any,
    host: any,
    tipo: any,
    puerto: any,
    PV: any
  ) {
    let body = JSON.stringify([$vales]);

    console.log(body);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
    return this.http
      .post(
        `${host}/ticket/${$foliovale}/${$clientevale}/${$pv}/${$tipo}/${IpImpresora}/${NombreImpresora}/${tipo}/${puerto}/${PV}`,
        body
      )
      .pipe(
        tap((response: any) => {
          console.log(response);
          if (response[0]['status'] === 'ok') {
            return true;
          } else {
            return false;
          }
        })
      );
  }

  PostSorteo(
    $cliente: any,
    $sorteo: any,
    $token: any,
    $usuario: any,
    $nip: any,
    $pv: any,
    $userkey: any,
    $local: any
  ): Promise<ApiResult> {
    const apiUrl = `${environment.baseUrl}rest/operacion?cliente=${$cliente}&cve_sorteo=${$sorteo}&token=${$token}&usuario=${$usuario}&nip=${$nip}&pv=${$pv}&userkey=${$userkey}&Sorteo=true&local=${$local}`;
    console.log(apiUrl);

    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  ValidaEmpleadoNipconEstacion(
    $usuario: any,
    $nip: any,
    $Cre: any,
    $Pv: any
  ): Promise<ApiResult> {
    const apiUrl = `${environment.baseUrl}rest/operacion?&usuario=${$usuario}&nip=${$nip}&pv=${$Pv}&Validacion=true&Cre=${$Cre}`;
    console.log(apiUrl);

    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  async ImprimirTicket(
    FolioTicket: any,
    NombreCliente: any,
    Puntos: any,
    Despachador: any,
    NumCliente: any
  ): Promise<ApiResult> {
    let host = await this.storage.get('host');
    console.log('Host antes de replace: ', host);
    var hosting = host.replace('restsociosmartv2', '');
    console.log('Host después de replace: ', hosting);
    //Esta en otro endpoint que esta en carpeta sociosmart en estacion local
    const apiUrl = `${hosting}sociosmart/ReimpresionReciclaje.php?conec=0&Reimpresion=0&FolioTicket=${FolioTicket}&Acumulacion=2&Cliente=${NombreCliente}&Material=Redencion%20puntos%20verdes&PrecioKilo=&PesoGramos=&PuntosVerdes=${Puntos}&Genero=${Despachador}&NumCliente=${NumCliente}&conecremoto=1`;
    console.log(apiUrl);
    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  ImprimirTicketOLD(
    FolioTicket: any,
    NombreCliente: any,
    Puntos: any,
    Despachador: any,
    NumCliente: any
  ) {
    return new Promise((resolve) => {
      this.storage.get('host').then((host) => {
        var hosting = host.replace('restsociosmartv2', '');
        //hosting='http://192.168.1.64:8081/';
        console.log('Invoca imprimirtocketold');
        console.log(
          hosting +
            'sociosmart/ReimpresionReciclaje.php?conec=0&Reimpresion=0&FolioTicket=' +
            FolioTicket +
            '&Acumulacion=2&Cliente=' +
            NombreCliente +
            '&Material=Redencion%20puntos%20verdes&PrecioKilo=&PesoGramos=&PuntosVerdes=' +
            Puntos +
            '&Genero=' +
            Despachador +
            '&NumCliente=' +
            NumCliente +
            '&conecremoto=1'
        );
        this.http
          .get(
            hosting +
              'sociosmart/ReimpresionReciclaje.php?conec=0&Reimpresion=0&FolioTicket=' +
              FolioTicket +
              '&Acumulacion=2&Cliente=' +
              NombreCliente +
              '&Material=Redencion%20puntos%20verdes&PrecioKilo=&PesoGramos=&PuntosVerdes=' +
              Puntos +
              '&Genero=' +
              Despachador +
              '&NumCliente=' +
              NumCliente +
              '&conecremoto=1'
          )
          .subscribe(
            (data) => {
              resolve(data);
            },
            (err) => {
              resolve(err);
            }
          );
      });
    });
  }

  postCanjeReciclaje(
    $pv: any,
    $cliente: any,
    $cantidad: any,
    $token: any,
    $usuario: any,
    $nip: any,
    $userkey: any,
    $usercve: any
  ) {
    let body = JSON.stringify({
      Token: $token,
      UsuarioOperador: $usuario,
      NipOperador: $nip,
      Estacion: $pv,
      Cantidad: $cantidad,
      Telefono: $cliente,
      KeyApi: $userkey,
      Usuario: $usercve,
    });
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
    console.log(body);
    console.log(`${environment.baseUrl}rest/PuntosVerdes?CanjeEstacion=true`);
    return this.http
      .post(`${environment.baseUrl}rest/PuntosVerdes?CanjeEstacion=true`, body)
      .pipe(
        tap((response: any) => {
          console.log(response);
          if (response[0]['status'] === 'ok') {
            return true;
          } else {
            return false;
          }
        })
      );
  }

  postTraepremio(folio: any, numero: any, estacion: any) {
    let body = JSON.stringify({
      idRequest: folio,
      reference: numero,
      codeStation: estacion,
    });
    console.log('body para premios; ', body);
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers = headers.append(
      'Acess-Control-Allow-Origin',
      'https://sociosmart.com.mx/servicios/api/'
    );
    headers = headers.append('Acess-Control-Allow-Methods', 'POST');
    headers = headers.append(
      'Acess-Control-Allow-Headers',
      'X-Requested-With,Content-Type'
    );
    let options = { headers: headers };
    console.log(body);
    return this.http
      .post(
        `https://smartgasgasolineras.mx/sorteos/sistema/api/requestAward`,
        body
      )
      .pipe(
        tap((response: any) => {
          console.log('La respuesta: ', response);
          if (response) {
            return response;
          } else {
            return false;
          }
        })
      );
  }

  async getValeCanjeGasCargaVale($id: any): Promise<ApiResult> {
    let token = await this.storage.get('Token');
    let UUID = await this.storage.get('UUID');

    const apiUrl = `${environment.baseUrl}rest/operacion?getValeCanjeGasCargaVale=${$id}&token=${token}&UUID=${UUID}`;

    console.log('url es: ', apiUrl);

    return this.http
      .get(apiUrl)
      .toPromise()
      .then((response) => {
        var data = JSON.stringify(response, null, 2);
        return JSON.parse(data);
      });
  }

  postValeopTaxi(
    $pv: any,
    $cliente: any,
    $cantidad: any,
    $prod: any,
    $user: any,
    $token: any,
    $ciudad: any,
    $uuid: any,
    $usuario: any,
    $nip: any
  ): Observable<ApiResult> {
    let body = JSON.stringify({});
    var httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    //https://sociosmart.ddns.net/rest/Operacion?
    console.log(
      'postValeopTaxi URL: ',
      `${environment.baseUrl}rest/operacion?pv=${$pv}&cliente=${$cliente}&prod=${$prod}&token=${$token}&ciudad=${$ciudad}&uuid=${$uuid}&empleado=${$usuario}&nip=${$nip}&canjetaxi=true`
    );
    return this.http
      .post<ApiResult>(
        `${environment.baseUrl}rest/operacion?pv=${$pv}&cliente=${$cliente}&prod=${$prod}&token=${$token}&ciudad=${$ciudad}&uuid=${$uuid}&empleado=${$usuario}&nip=${$nip}&canjetaxi=true`,
        body
      )
      .pipe(
        tap((data: any) => {
          if (data.status) {
            return data;
          } else {
            return data;
          }
        })
      );
  }

  GetCampanias(
    $puntoventa: any,
    $tokenparacampania: any,
    $uuidparacampania: any
  ): Observable<ApiResult> {
    console.log(
      `${environment.baseUrl}rest/operacion?puntoventa=${$puntoventa}&tokenparacampania=${$tokenparacampania}&uuidparacampania=${$uuidparacampania}`
    );
    return this.http.get<ApiResult>(
      `${environment.baseUrl}rest/operacion?puntoventa=${$puntoventa}&tokenparacampania=${$tokenparacampania}&uuidparacampania=${$uuidparacampania}`
    );
  }
}
