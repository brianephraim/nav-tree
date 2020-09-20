import { PureComponent } from 'react';
import { BackHandler } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withScreenConfig from './withScreenConfig';

const noop = () => null;
class AppHardwareBackButtonNotConnected extends PureComponent {
  static propTypes = {
    onHardwareBackPress: PropTypes.func,
    updateNavTree: PropTypes.func.isRequired,
    hardwareBackButtonDetails: PropTypes.object.isRequired,
  };
  static defaultProps = {
    onHardwareBackPress: noop,
  };
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      const cancel = this.props.onHardwareBackPress() === false;
      if (cancel) {
        return true; // does nothing
      }
      const {updateNavTreeSettings} = this.props.hardwareBackButtonDetails;
      !!updateNavTreeSettings && this.props.updateNavTree(
        this.props.hardwareBackButtonDetails.updateNavTreeSettings
      );
      return true; // does nothing
      // return false; // exits app;
    });
  }
  render() {
    return null;
  }
}

const AppHardwareBackButton = withScreenConfig(
  connect(
    ({ hardwareBackButtonDetails, alertOverlayContent, playVideoPlease }) => {
      return {
        hardwareBackButtonDetails,
        alertOverlayOpen: alertOverlayContent.length,
        videoDrawerOpen: playVideoPlease.drawerOpen,
      };
    },
    {
      closeVideo: () => dispatch => {
        dispatch({
          type: 'CLOSE_VIDEO_PLEASE',
        });
      },
    }
  )(AppHardwareBackButtonNotConnected)
);

export { AppHardwareBackButton };

export const hardwareBackButtonDetailsReducer = (state = {}, action) => {
  if (action.type === 'SET_HARDWARE_BACK_BUTTON_DETAILS') {
    if (action.clearUpdateNavTreeSettings) {
      return {};
    }
    if (action.updateNavTreeSettings) {
      const { type, ...remainingAction } = action;
      return remainingAction;
    }
    return state;
  }
  return state;
};


export const withSetHardwareBackButton = connect(
  null,
  {
    setHardwareBackButton: settings => dispatch =>
      dispatch({
        type: 'SET_HARDWARE_BACK_BUTTON_DETAILS',
        ...settings,
      }),
  }
);
