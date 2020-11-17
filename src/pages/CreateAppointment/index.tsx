import { useNavigation, useRoute } from '@react-navigation/native';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../hooks/Auth';

import {
  Container,
  Header,
  BackButton,
  UserAvatar,
  HeaderTitle,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
} from './styles';

interface RouteProps {
  providerId: string;
}
export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

export interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const { goBack } = useNavigation();
  const routeParams = route.params as RouteProps;

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(routeParams.providerId);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    api.get(`providers/${selectedProvider}/day-availability`, {
      params: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
      },
    }).then((response) => {
      console.log(response);

      setAvailability(response.data);
    });
  }, [selectedProvider, selectedDate]);

  useEffect(() => {
    api.get('providers').then((response) => {
      console.log(response);

      setProviders(response.data);
    });
  }, []);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  }, []);

  const handleDateChanged = useCallback((event: any, date: Date | undefined) => {
    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const morningAvailability = useMemo(() => availability
    .filter(({ hour }) => hour < 12)
    .map(({ hour, available }) => ({
      hour,
      available,
      hourFormatted: format(new Date().setHours(hour), 'HH:00'),
    })), [availability]);

  const afternoonAvailability = useMemo(() => availability
    .filter(({ hour }) => hour >= 12)
    .map(({ hour, available }) => ({
      hour,
      available,
      hourFormatted: format(new Date().setHours(hour), 'HH:00'),
    })), [availability]);
  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>
        <HeaderTitle>Cabeleireiros</HeaderTitle>
        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>
      <ProvidersListContainer>
        <ProvidersList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={(provider) => provider.id}
          renderItem={({ item: provider }) => (
            <ProviderContainer
              onPress={() => handleSelectProvider(provider.id)}
              selected={provider.id === selectedProvider}
            >
              <ProviderAvatar source={{ uri: provider.avatar_url }} />
              <ProviderName selected={provider.id === selectedProvider}>{provider.name}</ProviderName>
            </ProviderContainer>
          )}
        />
      </ProvidersListContainer>
      <Calendar>
        <Title>Escolha a data</Title>

        <OpenDatePickerButton onPress={handleToggleDatePicker}>
          <OpenDatePickerButtonText>Selecionar data</OpenDatePickerButtonText>
        </OpenDatePickerButton>
        { showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          onChange={handleDateChanged}
          mode="date"
          display="calendar"
        />
        )}
      </Calendar>
      {morningAvailability.map(({ hourFormatted }) => (
        <Title>{hourFormatted}</Title>
      ))}
    </Container>
  );
};

export default CreateAppointment;
