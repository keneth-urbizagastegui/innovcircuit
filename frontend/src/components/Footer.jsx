import { Link } from 'react-router-dom'
import { Mail, Github } from 'lucide-react'
import Logo from '../assets/brand-logo.svg'

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-[#CBD5E0] py-10 mt-12 border-t border-[#1E293B]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Columna 1: Información de la empresa */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src={Logo} alt="InnovCircuit" className="h-6 w-auto" />
            </div>
            <p className="text-sm">
              Tu plataforma para descubrir, comprar y vender diseños electrónicos innovadores.
            </p>
            <p className="mt-2 text-sm">&copy; {new Date().getFullYear()} InnovCircuit. Todos los derechos reservados.</p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-teal-300">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-300 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/explorar" className="hover:text-teal-300 transition-colors">Explorar Diseños</Link>
              </li>
              <li>
                <Link to="/subir-diseno" className="hover:text-teal-300 transition-colors">Vender en InnovCircuit</Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-teal-300 transition-colors">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Síguenos */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-teal-300">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="mailto:info@innovcircuit.com"
                className="text-teal-300 hover:text-teal-200 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/InnovCircuit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-teal-200 transition-colors"
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
