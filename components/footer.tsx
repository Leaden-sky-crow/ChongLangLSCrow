import Link from 'next/link'
import config from '@/config.json'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <img src="/favicon.jpg" alt="Logo" className="h-5 w-5 rounded-full" />
          <span className="font-medium text-foreground/80">{config.title}</span>
          <span aria-hidden="true">·</span>
          <span>{config.subtitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="transition-colors hover:text-foreground">
            关于我
          </Link>
          <a
            href="https://github.com/Leaden-sky-crow/ChongLangLSCrow"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
        <p>© {new Date().getFullYear()} {config.title} · 保留所有权利</p>
        {/* 如需备案号，在此处添加：<a href="https://beian.miit.gov.cn/">京ICP备XXXXXXXX号</a> */}
      </div>
    </footer>
  )
}
