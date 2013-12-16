using System;
using System.Collections.Generic;
using System.Web.Http.Dependencies;
using Ninject;
using Ninject.Syntax;


// ReSharper disable once CheckNamespace
namespace Typer.Web
{

    // Provides a Ninject implementation of IDependencyScope
    // which resolves services using the Ninject container.
    public class NinjectDependencyScope : IDependencyScope
    {

        private IResolutionRoot _resolver;

        public NinjectDependencyScope(IResolutionRoot resolver)
        {
            _resolver = resolver;
        }

        public object GetService(Type serviceType)
        {
            if (_resolver == null)
            {
                throw new ObjectDisposedException("this", "This scope has been disposed");
            }

            return _resolver.TryGet(serviceType);
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            if (_resolver == null)
                throw new ObjectDisposedException("this", "This scope has been disposed");

            return _resolver.GetAll(serviceType);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            var disposable = _resolver as IDisposable;
            if (disposable != null)
            {
                disposable.Dispose();
            }

            _resolver = null;
        }

    }

}