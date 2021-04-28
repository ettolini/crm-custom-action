const magicButtonElement = document.getElementById("magicButton");

const cityValue = Xrm.Page.getAttribute(
    "address1_line1"
    ).getValue();
const stateValue = Xrm.Page.getAttribute(
    "address1_line2"
).getValue();
const countryValue = Xrm.Page.getAttribute(
    "address1_line3"
).getValue();

var setCrmHeaders = (req) => {
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
};

const executeWebAPIRequest = (
    method,
    select,
    async,
    cacheKey = null,
    params = null,
    ttl = 180000
    ) =>
    new Promise((succeedCallback, errorCallback) => {
        alert(cityValue);
        
        if (cacheKey) {
            const cachedResult = sessionStorage.getItem(cacheKey);
            if (cachedResult) {
                const cachedItem = JSON.parse(cachedResult);
                
                //Existen cachés viejos que no tienen TTL
                if (cachedItem.expireTime) {
                    const date = new Date();
                    
                    if (date.getTime() < cachedItem.expireTime) {
                        console.info(`Se obtiene respuesta cacheada en key => ${cacheKey}`);
                        
                        return succeedCallback({ response: cachedItem.response });
                    }
                }
                sessionStorage.removeItem(cacheKey);
            }
        }
        
      var req = new XMLHttpRequest();
      req.open(method, select, async);
  
      setCrmHeaders(req);
      
      req.onreadystatechange = function () {
        try {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    if (cacheKey) {
                try {
                    const date = new Date();
                    
                    date.setMilliseconds(date.getMilliseconds() + ttl);
                    
                  const expireTimeFormatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                  
                  const cacheItem = {
                      response: this.response,
                      expireTime: date.getTime(),
                    expireTimeFormatted,
                };
                
                sessionStorage.setItem(cacheKey, JSON.stringify(cacheItem));
            } catch (e) {
                console.error(
                    `Error al intentar cachear respuesta en dirección ${cacheKey} =>`,
                    e
                    );
                }
            }
            return succeedCallback(this);
        } else if (this.status === 204) {
            return succeedCallback(this);
        }
        
        const result = this.response
        ? JSON.parse(this.response)
        : { status: this.status, statusText: this.statusText };
        
        errorCallback(result);
    }
} catch (ex) {
    console.error(
        'Error en el onReadyStateChange del executeWebAPIRequest =>',
        ex
        );
        errorCallback(ex);
    }
};

req.send(params);
});

var url = 'https://bortolancia.crm.dynamics.com';

var completeUrl = url + '/api/data/v9.1/custom_ActionGeocodificarDireccion';

const params = {
    city: cityValue,
    state: stateValue,
    country: countryValue
}

magicButtonElement.onclick = () =>
    executeWebAPIRequest('POST', completeUrl, true, null, JSON.stringify(params), null)
    .then((res) => console.log('RESPUESTA => ', JSON.parse(res.response)))
    .catch((error) => console.error(error));
