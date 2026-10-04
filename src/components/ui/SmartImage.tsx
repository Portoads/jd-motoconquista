import { useState, type ImgHTMLAttributes } from 'react'
import { Bike } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Imagem com carregamento suave e placeholder elegante quando falta ou falha. */
export function SmartImage({ src, alt, className, wrapperClassName, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { wrapperClassName?: string }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const show = src && !failed
  return (
    <div className={cn('relative overflow-hidden bg-graphite-100', wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-graphite-100 to-graphite-200" aria-hidden>
          <Bike className="h-10 w-10 text-graphite-300" strokeWidth={1.25} />
        </div>
      )}
      {show && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
          {...rest}
        />
      )}
    </div>
  )
}
