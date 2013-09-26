using System;
using System.Web.Http.Dependencies;
using Ninject;
using Ninject.Syntax;


namespace Typer.Web
{
   // This class is the resolver, but it is also the global scope
   // so we derive from NinjectScope.
   public class NinjectDependencyResolver : NinjectDependencyScope, IDependencyResolver
   {
      IKernel kernel;

      public NinjectDependencyResolver(IKernel kernel) : base(kernel)
      {
         this.kernel = kernel;
      }

      public IDependencyScope BeginScope()
      {
         return new NinjectDependencyScope(kernel.BeginBlock());
      }
   }
}