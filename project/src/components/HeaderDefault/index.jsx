import styles from './style.module.css'
import { Search, User, ShoppingBag } from 'lucide-react'

export function HeaderDefault() {
  return (
    <div className={styles.divContainer}>
      <header className={styles.divHeader}>
        <div>
          <p className={styles.brand}>Ecommerce-Project</p>
        </div>

        <nav className={styles.nav}>
          <a href="#">Produtos</a>
          <a href="#">Promocoes</a>
          <a href="#">Home</a>
          <a href="#">Contato</a>
        </nav>

        <div className={styles.divIcons}>
          <Search aria-label="Buscar" />
          <User aria-label="Usuario" />
          <ShoppingBag aria-label="Carrinho" />
        </div>
      </header>
    </div>
  )
}
