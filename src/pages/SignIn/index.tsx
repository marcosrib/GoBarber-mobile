import React from 'react';
import { Image } from 'react-native';
import logoImg from '../../assets/logo.png';

import { Container } from './styles';

const SignIn: React.FC = () => (
  <Container>
    <Image source={logoImg} />
  </Container>
);

export default SignIn;
