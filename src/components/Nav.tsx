import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Nav = () => {
  const location = useLocation()

  const links = [
    { text: 'pNetView', to: '/' },
    { text: 'About', to: '/about' },
  ]

  const activeClass = 'text-white bg-gray-900'
  const inactiveClass = 'text-gray-300 hover:text-white hover:bg-gray-700'
  const isLinkActive = (link: typeof links[0]) => {
    if (location.pathname === link.to) return true
    return false
  }

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-2 sm:px-2 lg:px-2">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                alt="Workflow logo"
              />
            </div>
            <div className="md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {links.map((link, i) => (
                  <Link
                    key={link.text}
                    to={link.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isLinkActive(link) ? activeClass : inactiveClass
                    } ${i > 0 && 'ml-4'}`}
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <a
                href="https://github.com/phyng/pnetview"
                className="bg-gray-800 p-1 rounded-full text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                Github
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Nav
