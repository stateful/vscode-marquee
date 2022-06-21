import Dragger from './Dragger'
import HidePop from './HidePop'
import WidgetWrapper from './WidgetWrapper'
import ThirdPartyWidget from './ThirdPartyWidget'
import HideWidgetContent from './HideWidgetContent'
import SplitButton from './SplitButton'
import HeaderWrapper from './HeaderWrapper'

export default WidgetWrapper
export { Dragger, HidePop, ThirdPartyWidget, HideWidgetContent, SplitButton, HeaderWrapper }

export interface MarqueeWidgetProps {
  fullscreenMode: boolean
  ToggleFullScreen: () => JSX.Element
}
