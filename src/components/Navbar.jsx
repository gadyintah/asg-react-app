// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/email">Email</Button>
        <Button color="inherit" component={Link} to="/sms">SMS</Button>
        <Button color="inherit" component={Link} to="/chat">Chat</Button>
        <Button color="inherit" component={Link} to="/call">Voice</Button>
      </Toolbar>
    </AppBar>
  );
}