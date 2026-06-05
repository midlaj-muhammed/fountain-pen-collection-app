/* eslint-disable react-native/no-raw-text */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { ToastHost, useToast } from './toast';

function Probe() {
  const toast = useToast();
  return (
    <Pressable testID="trigger" onPress={() => toast.show({ message: 'Saved' })}>
      <Text>trigger</Text>
    </Pressable>
  );
}

describe('toast', () => {
  it('does not render any toast before show() is called', () => {
    render(
      <ToastHost>
        <Probe />
      </ToastHost>,
    );
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('renders the toast after show() is called', () => {
    render(
      <ToastHost>
        <Probe />
      </ToastHost>,
    );
    act(() => {
      fireEvent.press(screen.getByTestId('trigger'));
    });
    expect(screen.getByText('Saved')).toBeTruthy();
  });
});

function ManualProbe() {
  const toast = useToast();
  return (
    <>
      <Pressable testID="dismiss" onPress={() => toast.dismiss()}>
        <Text>dismiss</Text>
      </Pressable>
      <Pressable
        testID="show-msg"
        onPress={() => {
          toast.show({ message: 'Visible' });
        }}
      >
        <Text>show-msg</Text>
      </Pressable>
    </>
  );
}

describe('toast.dismiss', () => {
  it('removes the current toast', () => {
    render(
      <ToastHost>
        <ManualProbe />
      </ToastHost>,
    );
    act(() => {
      fireEvent.press(screen.getByTestId('show-msg'));
    });
    expect(screen.getByText('Visible')).toBeTruthy();
    act(() => {
      fireEvent.press(screen.getByTestId('dismiss'));
    });
    expect(screen.queryByText('Visible')).toBeNull();
  });
});
