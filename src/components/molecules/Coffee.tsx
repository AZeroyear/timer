import { FC } from 'react';

const Coffee: FC = () => {
  return (
    <div className="flex-center" style={{ fontSize: 10, marginTop: 30 }}>
      <div>
        <p className="m-0">Support me</p>
        <a
          href="https://www.buymeacoffee.com/eastazy"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/lato-white.png"
            alt="Buy Me A Coffee"
            style={{ width: 150 }}
          />
        </a>
      </div>
    </div>
  );
};

export default Coffee;
