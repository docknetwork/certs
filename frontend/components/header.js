import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { fade, makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logout from '../helpers/logout';

const isServer = () => typeof window === 'undefined';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  appBar: {
    boxShadow: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.12)',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  navLinkActive: {
    color: '#1B76E9',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    marginLeft: '20px',
  },
  navLink: {
    marginLeft: '20px',
    textDecoration: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:active': {
      color: 'rgba(0, 0, 0, 0.6)',
      textDecoration: 'none',
    },
    '&:visited': {
      color: 'rgba(0, 0, 0, 0.6)',
      textDecoration: 'none',
    },
    '&:hover': {
      color: 'rgba(0, 0, 0, 1.0)',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
}));

export default function IssuerHeader({ user, updateUser }) {
  const classes = useStyles();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const showIssuerHeader = router.pathname !== '/issuer/onboarding' && !!user;
  const isRecipient = !showIssuerHeader;
  const isAuthed = (showIssuerHeader && user) || (isRecipient && (typeof localStorage !== 'undefined' && !!localStorage.getItem('recipientRef')));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    const wasRecipient = isRecipient;
    handleMenuClose();
    logout();
    updateUser();
    if (router.pathname === '/' || router.pathname === '/issuer/') {
      router.reload();
    } else {
      router.push(wasRecipient ? '/' : '/issuer/');
    }
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleClickSettings = () => {
    handleMenuClose();
    router.push('/settings/accounts');
  };

  const handleClickDIDs = () => {
    handleMenuClose();
    router.push('/settings/dids');
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleClickSettings}>My Accounts</MenuItem>
      <MenuItem onClick={handleClickDIDs}>My DIDs</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="secondary">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton aria-label="show 11 new notifications" color="inherit">
          <Badge badgeContent={11} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const authLinks = [{
    href: '/issuer/dashboard',
    text: 'Dashboard',
  }, {
    href: '/issuer/credentials',
    text: 'Credentials',
  }, {
    href: '/issuer/templates',
    text: 'Templates',
  }, {
    href: '/issuer/receivers',
    text: 'Recipients',
  }];

  const unauthLinks = [{
    href: '/',
    text: 'Recipients',
  }, {
    href: '/issuer/',
    text: 'Issuers',
  }];

  const AccountCircleButton = isAuthed && (
    <>
      <div className={classes.sectionDesktop}>
        <IconButton
          edge="end"
          aria-label="my account"
          aria-controls={menuId}
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </div>
        <div className={classes.sectionMobile}>
          <IconButton
            aria-label="show more"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
          <MoreIcon />
        </IconButton>
      </div>
    </>
  );

  const AuthedHeader = (
    <>
      <nav className={classes.sectionDesktop}>
        {authLinks.map((link) => (
          <Link href={link.href} passHref key={link.href}>
            <a className={link.href === router.pathname ? classes.navLinkActive : classes.navLink}>
              {link.text}
            </a>
          </Link>
        ))}
      </nav>
      <div className={classes.grow} />
      {AccountCircleButton}
    </>
  );

  const UnauthedHeader = (
    <>
      <nav className={classes.sectionDesktop}>
        {unauthLinks.map((link) => (
          <Link href={link.href} passHref key={link.href}>
            <a className={!isServer() && link.href === router.pathname ? classes.navLinkActive : classes.navLink}>
              {link.text}
            </a>
          </Link>
        ))}
      </nav>
      <div className={classes.grow} />
      {AccountCircleButton}
    </>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static" color="transparent" className={classes.appBar}>
        <Toolbar>
          <Link href={showIssuerHeader ? '/issuer/dashboard' : '/'} passHref>
            <a>
              <img style={{ margin: 0, marginRight: '40px' }} width="103px" height="26px" src={'/static/img/certs-logo.svg'} />
            </a>
          </Link>
          {showIssuerHeader ? AuthedHeader : UnauthedHeader}
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </div>
  );
}
