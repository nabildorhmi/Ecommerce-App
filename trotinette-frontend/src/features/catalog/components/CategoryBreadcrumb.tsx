import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';

interface CategoryBreadcrumbProps {
  category: { id: number; slug: string; name: string } | null | undefined;
}

/**
 * Breadcrumb navigation for the product detail page.
 * Shows: Home > [Category Name] (if category exists)
 * Category link navigates back to the catalog filtered by that category.
 */
export function CategoryBreadcrumb({ category }: CategoryBreadcrumbProps) {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      <MuiLink
        component={Link}
        to="/products"
        color="inherit"
        underline="hover"
      >
        Accueil
      </MuiLink>

      {category ? (
        <MuiLink
          component={Link}
          to={`/products?filter[category_id]=${category.id}`}
          color="inherit"
          underline="hover"
        >
          {category.name}
        </MuiLink>
      ) : (
        <Typography color="text.secondary">Catalogue</Typography>
      )}
    </Breadcrumbs>
  );
}
