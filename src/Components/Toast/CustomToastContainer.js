import { ToastContainer } from 'react-toastify';
import { useTheme } from '../../context/themeContext';
import { Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomToastContainer = () => {
    const { theme } = useTheme();

    return (
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme}
            transition={Zoom}
            limit={3}
            closeButton={true}
        />
    );
};

export default CustomToastContainer;