# Philip Barongo Ondieki - Portfolio Website

A modern, responsive portfolio website showcasing my journey as a Full-Stack Developer with a background in Real Estate and Property Management. Features a sleek dark/light mode toggle and cutting-edge web technologies.

## 👤 Author

**Philip Barongo Ondieki**
- GitHub: [@PhilipOndieki](https://github.com/PhilipOndieki)
- LinkedIn: [Philip Barongo](https://www.linkedin.com/in/philip-barongo-8b215028a)
- Twitter: [@philoloke](https://x.com/philoloke)
- Email: philipbarongo30@gmail.com


## 🌐 Live Demo

Visit the live website: https://philip2.netlify.app/

## ✨ Features

### 🎨 **Design & UI/UX**
- **Dark/Light Mode Toggle** - Smart theme switching with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, professional design with smooth animations
- **Smooth Transitions** - Seamless theme switching and hover effects

### 🚀 **Interactive Elements**
- **Scroll Animations** - Elements animate into view as you scroll
- **Staggered Skill Animations** - Skills showcase with delayed reveal effects
- **Parallax Effects** - Subtle parallax scrolling on hero section
- **Interactive Navigation** - Active link highlighting and smooth scrolling

### 📝 **Functionality**
- **Contact Form** - Functional contact form with real-time validation
- **CV Download** - One-click CV download in text format
- **Mobile Navigation** - Collapsible hamburger menu for mobile devices
### 🔗 **Integration**
- **Social Links** - Direct links to GitHub, LinkedIn, and Twitter profiles
- **Project Showcase** - Featured project with live demo links
- **Performance Optimized** - Debounced scroll handlers and efficient animations

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** CSS Custom Properties (CSS Variables) for theming
- **Layout:** CSS Flexbox and Grid
- **Icons:** Font Awesome 6.0.0
- **Animations:** CSS transitions, keyframes, and Intersection Observer API
- **Theme Management:** localStorage API for persistence
- **Responsive:** Mobile-first responsive design with media queries
- **Accessibility:** ARIA labels, focus management, and keyboard navigation

## 📁 Project Structure

```
portfolio-website/
├── index.html              # Main HTML structure
├── style.css              # Complete stylesheet with theme support
├── script.js              # Enhanced JavaScript functionality
├── philip_photoj2-removebg-preview.png  # Profile image
└── README.md              # Project documentation
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/PhilipOndieki/portfolio-website.git
   cd portfolio-website
   ```

2. **Open in browser**
   - **Simple method:** Open `index.html` directly in your browser
   - **Local server (recommended):**
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Python 2
     python -m SimpleHTTPServer 8000
     
     # Using Node.js http-server
     npx http-server -p 8000
     
     # Using PHP
     php -S localhost:8000
     ```

3. **View the website**
   - Navigate to `http://localhost:8000`
   - The theme will automatically match your system preference

## 🎨 Theme System

### **Dark/Light Mode Features:**
- **Automatic Detection** - Respects system theme preference by default
- **Manual Toggle** - Click the theme button in navigation
- **Persistent Storage** - Remembers your choice across sessions
- **Smooth Transitions** - All elements transition seamlessly between themes
- **Accessibility Compliant** - Proper contrast ratios and focus indicators

### **CSS Custom Properties:**
The theme system uses CSS custom properties for easy customization:

```css
:root {
    --bg-primary: #ffffff;      /* Main background */
    --text-primary: #333333;    /* Primary text */
    --accent-primary: #4a90e2;  /* Accent color */
    /* ... more variables */
}

[data-theme="dark"] {
    --bg-primary: #0d1117;      /* Dark background */
    --text-primary: #e6edf3;    /* Light text */
    --accent-primary: #58a6ff;  /* Dark mode accent */
    /* ... dark theme overrides */
}
```

## 🎨 Customization

### **Color Scheme:**
Easily customize colors by modifying CSS custom properties in `style.css`:

```css
:root {
    --accent-primary: #4a90e2;    /* Your brand color */
    --accent-secondary: #357abd;  /* Darker shade */
    --bg-primary: #ffffff;        /* Background */
    --text-primary: #333333;      /* Text color */
}
```

### **Content Sections:**
The website includes these customizable sections:
- **Hero** - Main introduction with call-to-action buttons
- **About** - Personal information and skills showcase  
- **Education** - Academic background and certifications
- **Projects** - Featured projects with live demo links
- **Interests** - Professional interests and passions
- **Contact** - Contact information and functional form

### **Adding New Projects:**
Duplicate the project card structure in `index.html`:

```html
<div class="project-card">
    <div class="project-image">
        <div class="project-overlay">
            <a href="YOUR_PROJECT_URL" target="_blank" class="btn-primary">View Live</a>
        </div>
    </div>
    <div class="project-content">
        <h3>Project Name</h3>
        <p class="project-subtitle">Technology Stack</p>
        <p>Project description...</p>
        <!-- Add tech stack and features -->
    </div>
</div>
```

### **Skills Section:**
Add new skills by duplicating skill items:

```html
<div class="skill-item">
    <i class="fab fa-your-icon"></i>
    <span>Skill Name</span>
</div>
```

## ⚡ Performance & Accessibility

### **Performance Optimizations:**
- **Debounced Scroll Handlers** - Optimized scroll event processing
- **Intersection Observer API** - Efficient scroll-based animations
- **CSS Custom Properties** - Fast theme switching without recomputation
- **Optimized Animations** - Hardware-accelerated CSS transforms
- **Lazy Loading Ready** - Structure supports easy image lazy loading

### **Accessibility Features:**
- **ARIA Labels** - Proper labeling for screen readers
- **Keyboard Navigation** - Full keyboard accessibility support
- **Focus Management** - Visible focus indicators and logical tab order
- **Semantic HTML** - Proper heading hierarchy and landmark elements
- **Color Contrast** - WCAG compliant contrast ratios in both themes
- **Reduced Motion Support** - Respects `prefers-reduced-motion` setting
- **High Contrast Mode** - Enhanced contrast for accessibility needs

### **Browser Support:**
- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base styles: Mobile (< 480px) */

@media (max-width: 480px) {
    /* Small mobile devices */
}

@media (max-width: 768px) {
    /* Tablets and large mobile */
}

/* Desktop: > 768px (default) */
```

## 📈 Future Enhancements

- [x] Dark mode toggle implementation
- [ ] Add more projects to portfolio showcase  
- [ ] Implement Progressive Web App (PWA) features
- [ ] Add blog section with dynamic content
- [ ] Integrate with headless CMS for easy content updates
- [ ] Add performance analytics and monitoring
- [ ] Implement advanced animations with Framer Motion
- [ ] Add multilingual support (i18n)
- [ ] Create admin dashboard for content management
- [ ] Add testimonials and recommendations section

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/enhancement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/enhancement`)
5. Open a Pull Request

### **Contribution Guidelines:**
- Follow existing code style and conventions
- Test responsiveness across different devices
- Ensure accessibility standards are maintained
- Update documentation for new features
- Maintain theme compatibility for dark/light modes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Philip Barongo Ondieki**
- 🌐 Portfolio: https://philip2.netlify.app/
- 💼 GitHub: [@PhilipOndieki](https://github.com/PhilipOndieki)
- 💼 LinkedIn: [Philip Barongo](https://www.linkedin.com/in/philip-barongo-8b215028a)
- 🐦 Twitter: [@philoloke](https://x.com/philoloke)
- 📧 Email: philipbarongo30@gmail.com
- 📱 Phone: +254 703 141 296

---

⭐ **If you found this portfolio helpful, please give it a star!**

*Built with passion, precision, and modern web technologies. Designed to inspire and showcase the future of web development.*
