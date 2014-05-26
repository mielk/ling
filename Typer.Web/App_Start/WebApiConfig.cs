﻿using System.Web.Http;

// ReSharper disable once CheckNamespace
namespace Typer.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                "DefaultApi", 
                "api/{controller}/{id}", 
                new
                {
                    id = RouteParameter.Optional
                }
            );
        }
    }
}
