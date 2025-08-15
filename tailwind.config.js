/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./ui/**/*.{js,ts,jsx,tsx,html}",
    "./scripts/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      // Custom colors for Figma plugin styling
      colors: {
        figma: {
          bg: '#ffffff',
          border: '#e5e5e5', 
          text: '#333333',
          textSecondary: '#666666',
          primary: '#0066cc',
          primaryHover: '#0052a3',
          success: '#18a0fb',
          successHover: '#0073e6',
          danger: '#e74c3c',
          dangerHover: '#c0392b',
          warning: '#f39c12',
          warningBg: '#fef9e7',
          errorBg: '#fdf2f2'
        }
      },
      fontSize: {
        'xs': '10px',
        'sm': '11px', 
        'base': '12px',
        'lg': '14px',
        'xl': '16px'
      },
      spacing: {
        '1': '4px',
        '2': '6px', 
        '3': '8px',
        '4': '12px',
        '5': '16px',
        '6': '20px'
      }
    },
  },
  plugins: [],
}

