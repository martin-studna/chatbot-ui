import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import App from '../../src/App.vue';

describe('App.vue', () => {
  it('renders toolbar', () => {
    const wrapper = shallowMount(App);
    expect(
      wrapper
        .find('div')
        .text()
        .equal(''),
    );
  });
});
