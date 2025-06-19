import "../assets/css/HeaderFooter.css"

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} ZPay Portal. All rights reserved.</p>
      <p>
        <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
      </p>
    </footer>
  );
}

export default Footer;