import { Link } from 'react-router-dom'
import { Mail, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1A202C] text-[#CBD5E0] py-10 mt-12 border-t border-[#2D3748]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Columna 1: Información de la empresa */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#C7F782]">InnovCircuit</h3>
            <p className="text-sm">
              Tu plataforma para descubrir, comprar y vender diseños electrónicos innovadores.
            </p>
            <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} InnovCircuit. Todos los derechos reservados.</p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#C7F782]">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-[#48BB78] transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/explorar" className="hover:text-[#48BB78] transition-colors">Explorar Diseños</Link>
              </li>
              <li>
                <Link to="/subir-diseno" className="hover:text-[#48BB78] transition-colors">Vender en InnovCircuit</Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-[#48BB78] transition-colors">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Síguenos */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#C7F782]">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="mailto:info@innovcircuit.com"
                className="text-[#C7F782] hover:text-[#48BB78] transition-colors"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/InnovCircuit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C7F782] hover:text-[#48BB78] transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
            <p className="mt-4 text-sm">Mantente al tanto de nuestras últimas novedades.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}