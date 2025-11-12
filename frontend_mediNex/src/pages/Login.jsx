import React, { useState } from 'react'

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const onSubmitHandler = async (event) => {
    event.preventDefault()
    // Your sign up or login logic here
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4 py-10">
      {/* Card wrapper */}
      <form
        className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-2xl border border-blue-200 rounded-2xl p-8 transition-all duration-500"
        onSubmit={onSubmitHandler}
      >
        {/* Animated Gradient Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-600 bg-clip-text animate-gradient-x mb-2">
            {state === 'Sign Up' ? 'Create an Account' : 'Login Page'}
          </h2>
          <p className="text-gray-600">
            Please {state === 'Sign Up' ? 'Sign Up' : 'Log in'} to book an appointment
          </p>
        </div>
        {/* Animated switching fields */}
        <div className="space-y-6">
          {state === 'Sign Up' && (
            <div className="flex flex-col animate-fade-in">
              <label className="text-blue-700 font-semibold mb-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white/70 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="flex flex-col animate-fade-in">
            <label className="text-blue-700 font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg border border-blue-200 bg-white/70 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex flex-col animate-fade-in">
            <label className="text-blue-700 font-semibold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="px-4 py-2 rounded-lg border border-blue-200 bg-white/70 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
              autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'}
              required
            />
          </div>
        </div>

        {/* Submit button with glow and animation */}
        <button
          type="submit"
          className="w-full mt-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-600 text-white font-bold text-lg shadow-lg hover:scale-105 hover:shadow-2xl transform transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
        >
          {state === 'Sign Up' ? 'Sign Up' : 'Log in'}
        </button>

        {/* Switch prompt */}
        <div className="mt-4 text-center text-gray-600">
          {state === 'Sign Up' ? (
            <p>
              Already have an account?{' '}
              <span
                className="text-indigo-600 underline cursor-pointer font-semibold transition hover:text-blue-600"
                onClick={() => {setState('Login'); scrollTo(0,0)}}
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Create a new account{' '}
              <span
                className="text-indigo-600 underline cursor-pointer font-semibold transition hover:text-blue-600"
                onClick={() => {setState('Sign Up');scrollTo(0,0)}}
                
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
      {/* Add animation keyframes in tailwind.config.js for animate-fade-in and animate-gradient-x if not already present */}
    </div>
  )
}

export default Login
