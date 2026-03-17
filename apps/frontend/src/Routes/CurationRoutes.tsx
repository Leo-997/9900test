import {
  Outlet,
  useHref,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { type JSX } from 'react';
import { CustomTabs } from '@/components/Common/Tabs';
import { curationTabs } from '@/constants/Curation/tabs';
import CurationLayout from '../layouts/Curation';


export default function CurationRoutes(): JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const href = useHref('.');

  const page = pathname.replace(href, '').replace('/', '');

  return (
    <CurationLayout>
      <CustomTabs
        variant="navigation"
        indicatorLocation="bottom"
        fullWidth
        value={page ? page : curationTabs[0].to}
        onChange={(e, v): void => {
          navigate(v);
        }}
        tabs={curationTabs.map(({ label, to }) => ({
          label,
          value: to,
        }))}
        scrollButtons
        allowScrollButtonsMobile
      />
      <Outlet />
    </CurationLayout>
  );
}
