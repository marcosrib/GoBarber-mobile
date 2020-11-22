import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import Icon from 'react-native-vector-icons/Feather';
import React, { useCallback, useRef } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, View, TextInput,
} from 'react-native';

import { Form } from '@unform/mobile';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErros';

import {
  Container, Title, UserAvataButton, UserAvatar,
} from './styles';
import { useAuth } from '../../hooks/Auth';

interface ProfileFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  old_password: string;
}

const Profile: React.FC = () => {
  const { user, updateUser, signOut } = useAuth();
  const formRef = useRef<FormHandles>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string().required(),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val) => !!val.length,
              then: Yup.string().required(),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), undefined], 'Confirmação incorreta'),
        });
        await schema.validate(data, {
          abortEarly: false,
        });
        const {
          name,
          email,
          password,
          password_confirmation,
          old_password,
        } = data;
        const formData = {
          name,
          email,
          ...(old_password
            ? {
              password,
              password_confirmation,
              old_password,
            }
            : {}),
        };
        console.log(formData);

        const response = await api.put('/profile', formData);
        updateUser(response.data);
        Alert.alert(
          'Perfil atualizado com sucesso!',
        );
        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }
        console.log(err.message);

        Alert.alert(
          'Erro ao atualizar perfil',
          'Ocorreu um erro ao atualizar perfil, tente novamente',
        );
      }
    },
    [navigation],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <Container>
          <UserAvataButton>
            <UserAvatar source={{ uri: user.avatar_url }} />
          </UserAvataButton>
          <View>
            <Title>Meu perfil</Title>
          </View>
          <Form initialData={user} style={{ width: '100%' }} ref={formRef} onSubmit={handleSignUp}>
            <Input
              autoCapitalize="words"
              name="name"
              icon="user"
              placeholder="Nome"
              returnKeyType="next"
              onSubmitEditing={() => { emailInputRef.current?.focus(); }}
              blurOnSubmit={false}
            />
            <Input
              ref={emailInputRef}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
              name="email"
              icon="mail"
              placeholder="E-mail"
              returnKeyType="next"
              onSubmitEditing={() => { oldPasswordInputRef.current?.focus(); }}
              blurOnSubmit={false}
            />
            <Input
              ref={oldPasswordInputRef}
              secureTextEntry
              name="old_password"
              icon="lock"
              placeholder="Senha"
              returnKeyType="next"
              textContentType="newPassword"
              containerStyle={{ marginTop: 16 }}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
            <Input
              ref={passwordInputRef}
              secureTextEntry
              name="password"
              icon="lock"
              placeholder="Nova senha"
              returnKeyType="next"
              textContentType="newPassword"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              blurOnSubmit={false}
            />
            <Input
              ref={confirmPasswordInputRef}
              secureTextEntry
              name="password_confirmation"
              icon="lock"
              placeholder="confirmar senha"
              returnKeyType="send"
              textContentType="newPassword"
              onSubmitEditing={() => formRef.current?.submitForm()}
            />
            <Button onPress={() => formRef.current?.submitForm()}>
              Confirmar mudanças

            </Button>
          </Form>
        </Container>
      </KeyboardAvoidingView>

    </>
  );
};

export default Profile;
