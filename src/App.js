import { provideFluentDesignSystem, fluentCard, fluentButton, fluentAccordion, fluentAccordionItem} from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import React from 'react';
import './App.css'
import 'antd/dist/antd.css';

import PictureDistortion from './examples/PictureDistortion.js';

const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());

    
export const FluentCard = wrap(fluentCard());
export const FluentButton = wrap(fluentButton());
export const FluentAccordion = wrap(fluentAccordion());
export const FluentAccordionItem = wrap(fluentAccordionItem());

function App() {
  document.title = "MVG examples"
  return (
    <div className={"flex-container"}>
      <div style={{margin: 10}}>
        <FluentAccordion className={"accordion"}>
          <FluentAccordionItem>
          <span slot="heading">Chapter 2</span>
          <div>
            Picture Distortion
          </div>
          </FluentAccordionItem>
        </FluentAccordion>
      </div>
      <div className={"content"}>
        <PictureDistortion/>
      </div>
    </div>
  );
}

export default App;