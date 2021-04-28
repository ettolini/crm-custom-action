using System;
using System.ServiceModel;
using Microsoft.Xrm.Sdk;
using System.Net.Http;

namespace MyCasesAction
{
    /// <summary>
    /// The plug-in creates a task activity after a new account is created. The activity reminds the user to
    /// follow-up with the new account customer one week after the account was created.
    /// </summary>
    /// <remarks>Register this plug-in on the Create message, account entity, and asynchronous mode.
    /// </remarks>

    public class GeocodificarDireccion : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            //Extract the tracing service for use in debugging sandboxed plug-ins.
            ITracingService tracingService =
                (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            // Obtain the execution context from the service provider.
            IPluginExecutionContext context = (IPluginExecutionContext)
                serviceProvider.GetService(typeof(IPluginExecutionContext));

            tracingService.Trace("Esta funcionando el plugin.");

            string baseUrl = "https://nominatim.openstreetmap.org/";

            Uri uri = new Uri(baseUrl);

            HttpClient client = new HttpClient() {
                 BaseAddress = uri
            };

            string city = (string)context.InputParameters["city"];
            string state = (string)context.InputParameters["state"];
            string country = (string)context.InputParameters["country"];

            string url = $"search?city={city}&state={state}&country={country}&format=json";

            tracingService.Trace("Se setean los headers.");
            client.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "text/html,application/json");
            client.DefaultRequestHeaders.TryAddWithoutValidation("User-Agent", "Plugin");

            tracingService.Trace("Se hace la llamada.");
            HttpResponseMessage response = client.GetAsync(url).Result;

            tracingService.Trace("Se lee el contenido.");
            string content = response.Content.ReadAsStringAsync().Result;

            tracingService.Trace($"Termina la ejecucion. Content: {content}");
            context.OutputParameters["result"] = content;

            tracingService.Trace(city);
            tracingService.Trace(state);
            tracingService.Trace(country);
        }
    }
}