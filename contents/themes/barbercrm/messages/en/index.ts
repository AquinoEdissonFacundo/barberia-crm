import analytics from './analytics.json'
import billing from './billing.json'
import common from './common.json'
import dev from './dev.json'
import features from './features.json'
import home from './home.json'
import navigation from './navigation.json'
import public_ from './public.json'
import settings from './settings.json'

export default {
  analytics,
  billing,
  common,
  dev,
  features,
  home,
  navigation,
  public: public_,
  settings,
} as const
