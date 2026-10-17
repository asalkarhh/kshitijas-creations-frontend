import { Instagram, ShoppingBag, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { env } from '../../app/config/env';
import { useCart } from '../../store/cart-context';
import { Modal } from '../common/Modal';
import { scrollToTop } from '../../utils/scrollToTop';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const mobileLinkClass =
  'block rounded-xl px-3 py-3 text-lg font-medium text-ink hover:bg-rose/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon';

export const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  const { itemCount } = useCart();
  return (
    <Modal isOpen={isOpen} onClose={onClose} position="right" title="Menu">
      <nav aria-label="Mobile navigation">
        <ul className="space-y-1">
          <li>
            <NavLink className={mobileLinkClass} onClick={() => { onClose(); scrollToTop(); }} to="/">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink className={mobileLinkClass} onClick={onClose} to="/products">
              Products
            </NavLink>
          </li>
          <li>
            <NavLink className={mobileLinkClass} onClick={onClose} to="/categories">
              Categories
            </NavLink>
          </li>
          <li>
            <a
              className={`${mobileLinkClass} flex items-center gap-3`}
              href={env.instagramUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Instagram aria-hidden="true" className="size-5" /> Instagram
            </a>
          </li>
          <li>
            <NavLink
              className={`${mobileLinkClass} flex items-center gap-3`}
              onClick={onClose}
              to="/cart"
            >
              <ShoppingBag aria-hidden="true" className="size-5" /> Cart
              {itemCount > 0 && (
                <span className="rounded-full bg-maroon px-2 py-0.5 text-xs text-white">
                  {itemCount}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              className={`${mobileLinkClass} flex items-center gap-3`}
              onClick={onClose}
              to="/admin/login"
            >
              <User aria-hidden="true" className="size-5" /> Admin
            </NavLink>
          </li>
        </ul>
      </nav>
      <p className="mt-10 border-t border-beige pt-6 text-sm leading-6 text-muted">
        Questions about a piece? Visit our Instagram—we are happy to help.
      </p>
    </Modal>
  );
};

