import React, { useEffect, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Keyboard, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import {
  Container, Title, ForgotPassword, ForgotPasswordText, CreateAccountButton, CreateAccountButtonText,
} from './styles';

const SignIn: React.FC = () => {
  const [isKeyboardShow, setIsKeyboardShow] = useState(true);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', handleKeyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    };
  }, []);

  function handleKeyboardDidShow() {
    setIsKeyboardShow(false);
  }

  function handleKeyboardDidHide() {
    setIsKeyboardShow(true);
  }

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <Container>
          <Image source={logoImg} />
          <View>
            <Title>Faça seu logo</Title>
          </View>
          <Input name="email" icon="mail" placeholder="E-mail" />
          <Input name="password" icon="lock" placeholder="Senha" />
          <Button onPress={() => {}}>Entrar</Button>
          <ForgotPassword>
            <ForgotPasswordText>Esqueci minha senha</ForgotPasswordText>
          </ForgotPassword>
        </Container>
      </KeyboardAvoidingView>
      { isKeyboardShow && (
      <CreateAccountButton>
        <Icon name="log-in" size={20} color="#ff9000" />
        <CreateAccountButtonText>Cria um conta</CreateAccountButtonText>
      </CreateAccountButton>
      ) }
    </>
  );
};

export default SignIn;
